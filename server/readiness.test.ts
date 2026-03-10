import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildReadinessSnapshot } from "./readiness";
import { getDb } from "./db";

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

const originalGhlApiKey = process.env.GHL_API_KEY;
const originalMetaPixelAccessToken = process.env.META_PIXEL_ACCESS_TOKEN;

function createDbMock(limitImpl: () => Promise<unknown>) {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        limit: vi.fn(limitImpl),
      })),
    })),
  };
}

describe("buildReadinessSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GHL_API_KEY = "ghl-key";
    process.env.META_PIXEL_ACCESS_TOKEN = "meta-token";
  });

  afterEach(() => {
    if (originalGhlApiKey === undefined) {
      delete process.env.GHL_API_KEY;
    } else {
      process.env.GHL_API_KEY = originalGhlApiKey;
    }
    if (originalMetaPixelAccessToken === undefined) {
      delete process.env.META_PIXEL_ACCESS_TOKEN;
    } else {
      process.env.META_PIXEL_ACCESS_TOKEN = originalMetaPixelAccessToken;
    }
  });

  it("returns ready when the database and lead table are accessible", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      createDbMock(async () => [])
    );

    const snapshot = await buildReadinessSnapshot();

    expect(snapshot.status).toBe("ready");
    expect(snapshot.checks).toEqual({
      database: true,
      leadTableAccessible: true,
      ghlApiKey: true,
      metaPixelAccessToken: true,
    });
    expect(snapshot.issues).toBeUndefined();
  });

  it("returns degraded when the lead table cannot be queried", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      createDbMock(async () => {
        throw new Error('relation "leads" does not exist');
      })
    );

    const snapshot = await buildReadinessSnapshot();

    expect(snapshot.status).toBe("degraded");
    expect(snapshot.checks.database).toBe(true);
    expect(snapshot.checks.leadTableAccessible).toBe(false);
    expect(snapshot.issues?.leadTableAccessible).toContain("relation");
  });
});
