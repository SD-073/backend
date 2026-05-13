## Part 1 — Understanding Authentication

### What is Authentication?

**Authentication** answers the question: *"Who are you?"*

It's the process of verifying a user's identity, typically by checking credentials such as a username and password. This is different from **authorization**, which answers *"What are you allowed to do?"*

| Concept | Question | Example |
|---|---|---|
| Authentication | Who are you? | Logging in with email + password |
| Authorization | What can you do? | Admins can delete users; regular users cannot |

### Common Authentication Strategies

1. **Session-based** — server stores session in memory/database, sends a session ID cookie to the client.
2. **Token-based (JWT)** — server issues a signed token; the client sends it back on every request. **Stateless.**
3. **OAuth / OpenID Connect** — delegated authentication (Google, GitHub login).
4. **API keys** — long-lived secrets for service-to-service calls.

In this lecture we will focus on **JWT (JSON Web Tokens)** because they are the de facto standard for modern REST APIs and are stateless, scalable, and easy to implement.

---

## Part 2 — JSON Web Tokens (JWT)

### Anatomy of a JWT

A JWT is a string with three parts separated by dots:

```
xxxxx.yyyyy.zzzzz
header.payload.signature
```

- **Header** — algorithm and token type, e.g. `{ "alg": "HS256", "typ": "JWT" }`
- **Payload** — claims about the user (`userId`, `email`, `iat`, `exp`)
- **Signature** — `HMACSHA256(base64(header) + "." + base64(payload), SECRET)`

The signature guarantees the token wasn't tampered with. **The payload is NOT encrypted** — anyone can decode it. Never put passwords or sensitive data in it.

### The JWT Flow

```
1. Client → POST /login (email, password)
2. Server validates credentials
3. Server signs a JWT and sends it back
4. Client stores the JWT (localStorage, cookie, etc.)
5. Client → GET /profile (Authorization: Bearer <token>)
6. Server verifies signature → grants access
```

---

## Part 3 — Project Setup

### Step 1: Initialize the project

```bash
mkdir auth-demo && cd auth-demo
npm init -y
```

### Step 2: Install dependencies

```bash
# Runtime dependencies
npm install express jsonwebtoken bcryptjs dotenv

# Development dependencies (TypeScript & types)
npm install -D typescript ts-node-dev @types/node @types/express @types/jsonwebtoken @types/bcryptjs
```

### Step 3: Configure TypeScript

Create a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

### Step 4: Add scripts to `package.json`

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Step 5: Environment variables (`.env`)

```env
PORT=3000
JWT_SECRET=super-secret-key-change-this-in-production
JWT_EXPIRES_IN=1h
```

**Never commit `.env` to git.** Add it to `.gitignore`.

### Project structure

```
auth-demo/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── auth.routes.ts
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── utils/
│   │   └── jwt.ts
│   └── types/
│       └── express.d.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## Part 4 — Building the Server

### 4.1 — Token utility (`src/utils/jwt.ts`)

This module centralizes token generation and verification.

```typescript
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate a signed JWT for a given user payload.
 */
export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify a JWT and return its decoded payload, or null if invalid.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
```

### 4.2 — Extend the Express Request type (`src/types/express.d.ts`)

We want to attach the decoded user to `req.user`. TypeScript needs to know about it:

```typescript
import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
```

### 4.3 — Authentication middleware (`src/middleware/auth.middleware.ts`)

This middleware runs before any protected route. It checks the `Authorization` header and verifies the token.

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = payload;
  next();
}
```

### 4.4 — Auth controller (`src/controllers/auth.controller.ts`)

For this lecture we use an **in-memory user store** so we can focus on the auth logic itself. In production you would use a real database (Postgres, MongoDB, etc.).

```typescript
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";

// In-memory "database"
interface User {
  id: string;
  email: string;
  passwordHash: string;
}

const users: User[] = [];

/**
 * POST /auth/register
 */
export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: String(users.length + 1),
    email,
    passwordHash,
  };
  users.push(newUser);

  const token = generateToken({ userId: newUser.id, email: newUser.email });
  return res.status(201).json({ token });
}

/**
 * POST /auth/login
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken({ userId: user.id, email: user.email });
  return res.json({ token });
}

/**
 * GET /auth/me — protected route
 */
export function me(req: Request, res: Response) {
  return res.json({ user: req.user });
}
```

**Note on `bcrypt`:** never store plain-text passwords. `bcrypt.hash` runs a slow, salted, one-way hash. The number `10` is the *salt rounds* (cost factor): higher = slower = harder to brute force. 10–12 is standard.

### 4.5 — Routes (`src/routes/auth.routes.ts`)

```typescript
import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me); // protected

export default router;
```

### 4.6 — The server (`src/server.ts`)

```typescript
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Auth demo running" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
```

---

## Part 5 — Running and Testing

### Run the server

```bash
npm run dev
```

### Test with `curl`

**Register a new user:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Response:
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR..." }
```

**Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

**Access a protected route:**

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
```

Response:
```json
{ "user": { "userId": "1", "email": "alice@example.com", "iat": ..., "exp": ... } }
```

Without a valid token, the server responds `401 Unauthorized`.

---

## Part 6 — Refresh Tokens

### Why do we need refresh tokens?

So far our login endpoint issues a single JWT. That creates a dilemma:

- If the token lives **a long time** (e.g. 30 days), a stolen token gives the attacker long-term access.
- If the token lives **a short time** (e.g. 15 minutes), users get logged out constantly.

**Refresh tokens** solve this by splitting the responsibility into two tokens:

| Token | Lifetime | Where it's sent | Purpose |
|---|---|---|---|
| **Access token** | Short (15 min) | `Authorization` header on every request | Authorizes API calls |
| **Refresh token** | Long (7–30 days) | Only sent to `/auth/refresh` | Obtains a new access token |

If an access token leaks, it expires quickly. The refresh token is sent rarely (only to one endpoint) and can be stored more securely.

### The refresh flow

```
1. Login        → server returns { accessToken, refreshToken }
2. API call     → client sends accessToken (Bearer header)
3. 401 expired  → client calls POST /auth/refresh with refreshToken
4. Server       → verifies refresh token, issues a NEW accessToken
                  (and optionally a new refreshToken — "rotation")
5. Logout       → server invalidates the refresh token
```

### 6.1 — Update environment variables

```env
PORT=3000
JWT_ACCESS_SECRET=access-secret-change-me
JWT_REFRESH_SECRET=refresh-secret-different-from-access
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Use two different secrets.** If one leaks, the other still protects its token type.

### 6.2 — Update the token utility (`src/utils/jwt.ts`)

```typescript
import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in environment variables");
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
```

### 6.3 — Update the middleware

Only the function name changes — use `verifyAccessToken` instead of `verifyToken`:

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }

  req.user = payload;
  next();
}
```

### 6.4 — Storing refresh tokens server-side

A refresh token must be **revocable** (so logout actually works). The simplest approach is to keep a list of valid refresh tokens. In production this would be Redis or a database table.

```typescript
// In-memory store of valid refresh tokens, keyed by userId
const refreshTokenStore = new Map<string, Set<string>>();

export function saveRefreshToken(userId: string, token: string) {
  if (!refreshTokenStore.has(userId)) {
    refreshTokenStore.set(userId, new Set());
  }
  refreshTokenStore.get(userId)!.add(token);
}

export function isRefreshTokenValid(userId: string, token: string): boolean {
  return refreshTokenStore.get(userId)?.has(token) ?? false;
}

export function revokeRefreshToken(userId: string, token: string) {
  refreshTokenStore.get(userId)?.delete(token);
}

export function revokeAllRefreshTokens(userId: string) {
  refreshTokenStore.delete(userId);
}
```

You can put these helpers in `src/utils/tokenStore.ts`.

### 6.5 — Update the auth controller

```typescript
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import {
  saveRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
  revokeAllRefreshTokens,
} from "../utils/tokenStore";

interface User {
  id: string;
  email: string;
  passwordHash: string;
}

const users: User[] = [];

/** Helper: issue a fresh pair of tokens and remember the refresh one. */
function issueTokens(user: User) {
  const payload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  saveRefreshToken(user.id, refreshToken);
  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = { id: String(users.length + 1), email, passwordHash };
  users.push(newUser);

  return res.status(201).json(issueTokens(newUser));
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  return res.json(issueTokens(user));
}

/**
 * POST /auth/refresh
 * Body: { refreshToken: string }
 * Implements token ROTATION: the old refresh token is invalidated
 * and a brand-new pair is issued.
 */
export function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }

  // Was it issued by us and still active?
  if (!isRefreshTokenValid(payload.userId, refreshToken)) {
    // Possible token reuse — treat as compromise and revoke everything for this user
    revokeAllRefreshTokens(payload.userId);
    return res.status(401).json({ message: "Refresh token has been revoked" });
  }

  // Rotate: invalidate the old one, issue a fresh pair
  revokeRefreshToken(payload.userId, refreshToken);
  const user = users.find((u) => u.id === payload.userId);
  if (!user) return res.status(401).json({ message: "User no longer exists" });

  return res.json(issueTokens(user));
}

/**
 * POST /auth/logout
 * Body: { refreshToken: string }
 */
export function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }
  const payload = verifyRefreshToken(refreshToken);
  if (payload) {
    revokeRefreshToken(payload.userId, refreshToken);
  }
  return res.json({ message: "Logged out" });
}

export function me(req: Request, res: Response) {
  return res.json({ user: req.user });
}
```

### 6.6 — Add the new routes

```typescript
import { Router } from "express";
import { register, login, refresh, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;
```

### 6.7 — Testing the refresh flow

**Login** — now returns two tokens:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

**Refresh** — exchange the refresh token for a new pair:

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOi..."}'
```

**Logout** — invalidate a refresh token:

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOi..."}'
```

After logout, that refresh token can no longer mint new access tokens.

### Key concepts to highlight

- **Token rotation** — every call to `/refresh` invalidates the old refresh token and issues a new one. If an attacker steals a refresh token but the legitimate user refreshes first, the attacker's copy becomes useless.
- **Reuse detection** — if a *revoked* refresh token is presented, that's a strong signal of theft; we revoke all of the user's sessions as a defensive response.
- **Storage on the client** — store the refresh token as securely as possible. The strongest option is an `httpOnly`, `Secure`, `SameSite=Strict` cookie set by the server, so JavaScript can't read it (mitigating XSS).
- **In production**, replace the in-memory `Map` with Redis or a `refresh_tokens` database table containing the token (or its hash), `userId`, `expiresAt`, and `revokedAt`.

---

## Part 7 — Security Best Practices

1. **Hash passwords** with bcrypt or argon2. Never store them in plain text.
2. **Use HTTPS in production** — JWTs travel in headers and can be intercepted on plain HTTP.
3. **Keep `JWT_SECRET` long and random** (at least 32 bytes) and rotate it periodically.
4. **Short token lifetimes** (15 minutes – 1 hour) combined with **refresh tokens** for renewing sessions.
5. **Don't put sensitive data in the payload** — it's only base64-encoded, not encrypted.
6. **Validate input** — use libraries like `zod` or `joi`.
7. **Rate-limit auth endpoints** to prevent brute-force attacks (`express-rate-limit`).
8. **Use `httpOnly` cookies** instead of localStorage when possible to mitigate XSS.
9. **Implement logout** by maintaining a token blocklist or rotating refresh tokens.
10. **Add CORS** carefully — only whitelist your trusted frontends.

