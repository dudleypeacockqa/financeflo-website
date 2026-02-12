import { timingSafeEqual } from "crypto";
import type { Express, Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, SESSION_MAX_AGE_MS } from "@shared/const";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import * as db from "./db";
import type { User } from "../drizzle/schema";

// ─── RATE LIMITER ──────────────────────────────────────────────────────────

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return first.trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now >= entry.resetAt) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

function recordLoginAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count++;
  }
}

function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// Periodically clean up expired entries to prevent memory leaks
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  loginAttempts.forEach((entry, ip) => {
    if (now >= entry.resetAt) loginAttempts.delete(ip);
  });
}, 60_000);
cleanupTimer.unref(); // Don't keep process alive (prevents vitest from hanging)

// ─── PASSWORD COMPARISON ───────────────────────────────────────────────────

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");

  // Pad to equal length to prevent length-based timing leaks
  const maxLen = Math.max(bufA.length, bufB.length);
  const paddedA = Buffer.alloc(maxLen);
  const paddedB = Buffer.alloc(maxLen);
  bufA.copy(paddedA);
  bufB.copy(paddedB);

  // timingSafeEqual requires same-length buffers
  return bufA.length === bufB.length && timingSafeEqual(paddedA, paddedB);
}

// ─── JWT / SESSION ─────────────────────────────────────────────────────────

function getSessionSecret() {
  return new TextEncoder().encode(ENV.jwtSecret);
}

async function createSessionToken(openId: string, name: string): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + SESSION_MAX_AGE_MS) / 1000);
  const secretKey = getSessionSecret();

  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Verify session token from request cookie.
 * Returns the User if valid, null otherwise.
 */
export async function verifySessionToken(req: Request): Promise<User | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = parseCookieHeader(cookieHeader);
  const sessionCookie = cookies[COOKIE_NAME];
  if (!sessionCookie) return null;

  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(sessionCookie, secretKey, {
      algorithms: ["HS256"],
    });
    const openId = payload.openId as string;
    if (!openId) return null;

    const user = await db.getUserByOpenId(openId);
    return user ?? null;
  } catch {
    return null;
  }
}

/**
 * Register auth routes on the Express app.
 */
export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req, res) => {
    const ip = getClientIp(req);

    // Check rate limit before processing
    const { limited, retryAfterSeconds } = isRateLimited(ip);
    if (limited) {
      res.set("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: "Too many login attempts. Please try again later.",
        retryAfterSeconds,
      });
      return;
    }

    try {
      const { password } = req.body;

      if (!password || !secureCompare(password, ENV.adminPassword)) {
        recordLoginAttempt(ip);
        // Use generic message to avoid leaking whether password field was missing vs wrong
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Successful login — clear rate limit for this IP
      clearLoginAttempts(ip);

      // Create/upsert admin user
      await db.upsertUser({
        openId: "admin",
        name: "Admin",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const token = await createSessionToken("admin", "Admin");
      const cookieOptions = getSessionCookieOptions(req);

      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: SESSION_MAX_AGE_MS,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}

// ─── TEST HELPERS ─────────────────────────────────────────────────────────
// Expose internals only in test environment so vitest can reach private functions

export const __testing =
  process.env.NODE_ENV === "test"
    ? { secureCompare, resetRateLimiter: () => loginAttempts.clear() }
    : undefined;
