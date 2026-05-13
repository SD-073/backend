import type { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '#config';
import { User, RefreshToken } from '#models';
import {
  generateRefreshToken,
  refreshCookieOptions,
  signAccessToken,
  verifyAccessToken
} from '#utils';

const userResponse = (user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  roles: user.roles
});

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (await User.exists({ email })) {
      throw new Error('Email already in use', { cause: { status: 409 } });
    }

    // const hashed = await bcrypt.hash(password, 10);
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password: hashed, firstName, lastName });

    const accessToken = signAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    await RefreshToken.create({ token: refreshToken, userId: user._id });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(201).json({ accessToken, user: userResponse(user as never) });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password', { cause: { status: 401 } });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error('Invalid email or password', { cause: { status: 401 } });
    }

    await RefreshToken.deleteMany({ userId: user._id });

    const accessToken = signAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    await RefreshToken.create({ token: refreshToken, userId: user._id });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.json({ accessToken, user: userResponse(user as never) });
  } catch (err) {
    next(err);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies ?? {};
    if (!refreshToken) {
      throw new Error('Missing refresh token', { cause: { status: 401 } });
    }

    const stored = await RefreshToken.findOneAndDelete({ token: refreshToken });
    if (!stored) {
      res.clearCookie('refreshToken', { path: '/auth' });
      throw new Error('Invalid refresh token', { cause: { status: 401 } });
    }

    const user = await User.findById(stored.userId);
    if (!user) {
      res.clearCookie('refreshToken', { path: '/auth' });
      throw new Error('Invalid refresh token', { cause: { status: 401 } });
    }

    const accessToken = signAccessToken(user.id);
    const newRefreshToken = generateRefreshToken();
    await RefreshToken.create({ token: newRefreshToken, userId: user._id });

    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies ?? {};
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.clearCookie('refreshToken', { path: '/auth' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new Error('Missing access token', { cause: { status: 401 } });
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new Error('Missing access token', { cause: { status: 401 } });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      if (
        err instanceof Error &&
        err.cause &&
        typeof err.cause === 'object' &&
        'code' in err.cause &&
        err.cause.code === 'ACCESS_TOKEN_EXPIRED'
      ) {
        res.setHeader('WWW-Authenticate', 'Bearer error="token_expired"');
      }
      throw err;
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new Error('User not found', { cause: { status: 404 } });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
