import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import { COOKIE_NAME, SESSION_MAX_AGE_MS } from "@shared/const";

// ─── MOCKS ─────────────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  upsertUser: vi.fn(async () => {}),
  getUserByOpenId: vi.fn(async () => undefined),
}));

vi.mock("./env", () => ({
  ENV: {
    adminPassword: "correct-horse-battery-staple",
    jwtSecret: "test-jwt-secret-at-least-32-chars-long!!",
  },
}));

vi.mock("./cookies", () => ({
  getSessionCookieOptions: vi.fn(() => ({
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: false,
  })),
}));

// ─── APP FACTORY ───────────────────────────────────────────────────────────

import { registerAuthRoutes, verifySessionToken, __testing } from "./auth";
import * as db from "./db";

function createApp() {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json());
  registerAuthRoutes(app);
  return app;
}

// ─── secureCompare ─────────────────────────────────────────────────────────

describe("secureCompare", () => {
  const { secureCompare } = __testing!;

  it("returns true for identical strings", () => {
    expect(secureCompare("abc123", "abc123")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(secureCompare("abc123", "xyz789")).toBe(false);
  });

  it("returns false for different-length strings", () => {
    expect(secureCompare("short", "a-longer-string")).toBe(false);
  });

  it("returns false for empty vs non-empty", () => {
    expect(secureCompare("", "non-empty")).toBe(false);
  });

  it("returns true for two empty strings", () => {
    expect(secureCompare("", "")).toBe(true);
  });
});

// ─── POST /api/auth/login -- success ───────────────────────────────────────

describe("POST /api/auth/login -- success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __testing!.resetRateLimiter();
  });

  it("returns 200 and sets session cookie on correct password", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "correct-horse-battery-staple" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
    expect(cookieStr).toContain(COOKIE_NAME);
  });

  it("calls db.upsertUser with admin data", async () => {
    const app = createApp();

    await request(app)
      .post("/api/auth/login")
      .send({ password: "correct-horse-battery-staple" });

    expect(db.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: "admin",
        name: "Admin",
        role: "admin",
      })
    );
  });

  it("clears rate limit counter after successful login", async () => {
    const app = createApp();

    // Accumulate some failed attempts first
    for (let i = 0; i < 3; i++) {
      await request(app).post("/api/auth/login").send({ password: "wrong" });
    }

    // Successful login clears the counter
    await request(app)
      .post("/api/auth/login")
      .send({ password: "correct-horse-battery-staple" });

    // Should be able to fail 5 more times before being rate limited
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "wrong" });
      expect(res.status).toBe(401);
    }
  });
});

// ─── POST /api/auth/login -- failure responses ────────────────────────────

describe("POST /api/auth/login -- failure responses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __testing!.resetRateLimiter();
  });

  it("returns 401 with generic message when password is wrong", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 401 with same generic message when password field is missing", async () => {
    const app = createApp();

    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns 401 with same generic message when password is empty string", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("does not set a cookie on failed login", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "wrong" });

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeUndefined();
  });
});

// ─── POST /api/auth/login -- rate limiting ─────────────────────────────────

describe("POST /api/auth/login -- rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __testing!.resetRateLimiter();
  });

  it("allows up to 5 failed attempts without blocking", async () => {
    const app = createApp();

    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "wrong" });
      expect(res.status).toBe(401);
    }
  });

  it("returns 429 with Retry-After header after 5 failed attempts", async () => {
    const app = createApp();

    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/auth/login").send({ password: "wrong" });
    }

    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "wrong" });

    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBeDefined();
    expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
    expect(res.body.error).toContain("Too many login attempts");
  });

  it("blocks even correct password after rate limit is hit", async () => {
    const app = createApp();

    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/auth/login").send({ password: "wrong" });
    }

    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "correct-horse-battery-staple" });

    expect(res.status).toBe(429);
  });

  it("isolates rate limiting by IP address", async () => {
    const app = createApp();

    // Exhaust rate limit for IP "1.1.1.1"
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "1.1.1.1")
        .send({ password: "wrong" });
    }

    // IP "2.2.2.2" should still be allowed
    const res = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "2.2.2.2")
      .send({ password: "wrong" });

    expect(res.status).toBe(401); // Not 429
  });

  it("resets rate limit after window expires", async () => {
    vi.useFakeTimers();
    try {
      const app = createApp();

      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/api/auth/login")
          .set("X-Forwarded-For", "10.0.0.1")
          .send({ password: "wrong" });
      }

      // Confirm blocked
      const blocked = await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "10.0.0.1")
        .send({ password: "wrong" });
      expect(blocked.status).toBe(429);

      // Advance past 15-minute window
      vi.advanceTimersByTime(15 * 60 * 1000 + 1);

      // Should be allowed again
      const res = await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "10.0.0.1")
        .send({ password: "wrong" });
      expect(res.status).toBe(401); // Not 429
    } finally {
      vi.useRealTimers();
    }
  });
});

// ─── POST /api/auth/login -- IP extraction ─────────────────────────────────

describe("POST /api/auth/login -- IP extraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __testing!.resetRateLimiter();
  });

  it("uses X-Forwarded-For first entry when present", async () => {
    const app = createApp();

    // Exhaust limit for the forwarded IP
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "203.0.113.50, 70.41.3.18")
        .send({ password: "wrong" });
    }

    // Same forwarded IP should be blocked
    const res = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "203.0.113.50, 99.99.99.99")
      .send({ password: "wrong" });

    expect(res.status).toBe(429);
  });
});

// ─── verifySessionToken ────────────────────────────────────────────────────

describe("verifySessionToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __testing!.resetRateLimiter();
  });

  it("returns null when no cookie header is present", async () => {
    const req = { headers: {} } as express.Request;
    const result = await verifySessionToken(req);
    expect(result).toBeNull();
  });

  it("returns null when cookie exists but token is invalid", async () => {
    const req = {
      headers: { cookie: `${COOKIE_NAME}=garbage-token` },
    } as express.Request;

    const result = await verifySessionToken(req);
    expect(result).toBeNull();
  });

  it("returns user when token is valid and user exists in DB", async () => {
    const app = createApp();

    const fakeUser = {
      id: 1,
      openId: "admin",
      name: "Admin",
      role: "admin",
      email: null,
      loginMethod: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    (db.getUserByOpenId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      fakeUser
    );

    // Login to get a valid token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ password: "correct-horse-battery-staple" });

    const cookies = loginRes.headers["set-cookie"];
    const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
    const tokenMatch = cookieStr.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = tokenMatch![1];

    const req = {
      headers: { cookie: `${COOKIE_NAME}=${token}` },
    } as express.Request;

    const result = await verifySessionToken(req);
    expect(result).toEqual(fakeUser);
  });

  it("returns null when token is valid but user not found in DB", async () => {
    const app = createApp();

    (db.getUserByOpenId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      undefined
    );

    // Login to get a valid token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ password: "correct-horse-battery-staple" });

    const cookies = loginRes.headers["set-cookie"];
    const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
    const tokenMatch = cookieStr.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = tokenMatch![1];

    const req = {
      headers: { cookie: `${COOKIE_NAME}=${token}` },
    } as express.Request;

    const result = await verifySessionToken(req);
    expect(result).toBeNull();
  });
});

// ─── JWT session -- 24-hour expiry ─────────────────────────────────────────

describe("JWT session -- 24-hour expiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __testing!.resetRateLimiter();
  });

  it("creates tokens that expire after ~24 hours (check exp claim)", async () => {
    const app = createApp();

    const beforeLogin = Math.floor(Date.now() / 1000);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ password: "correct-horse-battery-staple" });

    const afterLogin = Math.floor(Date.now() / 1000);

    const cookies = loginRes.headers["set-cookie"];
    const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
    const tokenMatch = cookieStr.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = tokenMatch![1];

    // Decode the JWT payload (base64url)
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

    const expectedExpSeconds = SESSION_MAX_AGE_MS / 1000; // 86400
    const expFromBefore = payload.exp - beforeLogin;
    const expFromAfter = payload.exp - afterLogin;

    // exp should be ~24h from now (allowing 5s tolerance)
    expect(expFromBefore).toBeGreaterThanOrEqual(expectedExpSeconds - 5);
    expect(expFromAfter).toBeLessThanOrEqual(expectedExpSeconds + 5);
  });

  it("rejects tokens older than 24 hours", async () => {
    vi.useFakeTimers();
    try {
      const app = createApp();

      const fakeUser = {
        id: 1,
        openId: "admin",
        name: "Admin",
        role: "admin",
        email: null,
        loginMethod: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      (db.getUserByOpenId as ReturnType<typeof vi.fn>).mockResolvedValue(
        fakeUser
      );

      // Login to get a token at "now"
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ password: "correct-horse-battery-staple" });

      const cookies = loginRes.headers["set-cookie"];
      const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
      const tokenMatch = cookieStr.match(
        new RegExp(`${COOKIE_NAME}=([^;]+)`)
      );
      const token = tokenMatch![1];

      // Token should work immediately
      const reqNow = {
        headers: { cookie: `${COOKIE_NAME}=${token}` },
      } as express.Request;
      const resultNow = await verifySessionToken(reqNow);
      expect(resultNow).toEqual(fakeUser);

      // Advance past 24 hours
      vi.advanceTimersByTime(SESSION_MAX_AGE_MS + 1000);

      // Token should now be rejected
      const reqLater = {
        headers: { cookie: `${COOKIE_NAME}=${token}` },
      } as express.Request;
      const resultLater = await verifySessionToken(reqLater);
      expect(resultLater).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
