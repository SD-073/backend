import crypto from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { ACCESS_JWT_SECRET, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '#config';

export const signAccessToken = (userId: string): string =>
  jwt.sign({ sub: userId }, ACCESS_JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const payload = jwt.verify(token, ACCESS_JWT_SECRET);
    if (typeof payload === 'string') {
      throw new Error('Invalid access token', { cause: { status: 401 } });
    }
    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired', {
        cause: { status: 401, code: 'ACCESS_TOKEN_EXPIRED' }
      });
    }
    if (err instanceof Error && err.cause) throw err;
    throw new Error('Invalid access token', { cause: { status: 401 } });
  }
};

export const generateRefreshToken = (): string => crypto.randomBytes(64).toString('hex');

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: REFRESH_TOKEN_TTL * 1000,
  path: '/auth'
};
