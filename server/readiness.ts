import { leads } from "../drizzle/schema";
import { getDb } from "./db";

export type ReadinessSnapshot = {
  status: "ready" | "degraded";
  checks: {
    database: boolean;
    leadTableAccessible: boolean;
    ghlApiKey: boolean;
    metaPixelAccessToken: boolean;
  };
  issues?: {
    leadTableAccessible?: string;
  };
};

export async function buildReadinessSnapshot(): Promise<ReadinessSnapshot> {
  const db = await getDb();
  let leadTableAccessible = false;
  let leadTableError: string | undefined;

  if (db) {
    try {
      await db.select({ id: leads.id }).from(leads).limit(1);
      leadTableAccessible = true;
    } catch (error) {
      leadTableError = error instanceof Error ? error.message : String(error);
    }
  }

  const checks = {
    database: Boolean(db),
    leadTableAccessible,
    ghlApiKey: Boolean(process.env.GHL_API_KEY),
    metaPixelAccessToken: Boolean(process.env.META_PIXEL_ACCESS_TOKEN),
  };
  const ready = Object.values(checks).every(Boolean);

  return {
    status: ready ? "ready" : "degraded",
    checks,
    issues: leadTableError ? { leadTableAccessible: leadTableError } : undefined,
  };
}
