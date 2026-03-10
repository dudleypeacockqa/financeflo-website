import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const poolQuery = vi.fn();
const poolEnd = vi.fn(async () => undefined);
const poolCtor = vi.fn(() => ({
  query: poolQuery,
  end: poolEnd,
}));
const drizzleMock = vi.fn();

vi.mock("pg", () => ({
  default: {
    Pool: poolCtor,
  },
}));

vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: drizzleMock,
}));

const originalDatabaseUrl = process.env.DATABASE_URL;

async function flushAsyncWork() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("getDb", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgres://financeflo:test@localhost:5432/app";
    drizzleMock.mockReturnValue({ select: vi.fn() });
    poolCtor.mockImplementation(() => ({
      query: poolQuery,
      end: poolEnd,
    }));
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it("returns a db client even when pgvector bootstrap fails", async () => {
    poolQuery
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockRejectedValueOnce(new Error("permission denied to create extension"));

    const { getDb } = await import("./db");
    const db = await getDb();

    await flushAsyncWork();

    expect(db).toBe(drizzleMock.mock.results[0]?.value);
    expect(poolQuery).toHaveBeenNthCalledWith(1, "SELECT 1");
    expect(poolQuery).toHaveBeenNthCalledWith(
      2,
      "CREATE EXTENSION IF NOT EXISTS vector"
    );
    expect(poolEnd).not.toHaveBeenCalled();
  });

  it("skips the HNSW bootstrap when the knowledge chunk table is missing", async () => {
    poolQuery
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ exists: false }] });

    const { getDb } = await import("./db");
    const db = await getDb();

    await flushAsyncWork();

    expect(db).toBe(drizzleMock.mock.results[0]?.value);
    expect(poolQuery).toHaveBeenCalledTimes(3);
    expect(poolQuery.mock.calls[2]?.[0]).toContain("information_schema.tables");
  });

  it("returns null when the initial connectivity check fails", async () => {
    poolQuery.mockRejectedValueOnce(new Error("connect ECONNREFUSED"));

    const { getDb } = await import("./db");
    const db = await getDb();

    expect(db).toBeNull();
    expect(drizzleMock).not.toHaveBeenCalled();
    expect(poolEnd).toHaveBeenCalledTimes(1);
  });
});
