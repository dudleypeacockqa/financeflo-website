import type { Express, Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import * as db from "./db";
import type { User } from "../drizzle/schema";

function getSessionSecret() {
  return new TextEncoder().encode(ENV.jwtSecret);
}

async function createSessionToken(openId: string, name: string): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  const secretKey = getSessionSecret();

  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Verify session token from request cookie.
 * Returns the User if valid, throws otherwise.
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
    try {
      const { password } = req.body;
      if (!password || password !== ENV.adminPassword) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }

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
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
