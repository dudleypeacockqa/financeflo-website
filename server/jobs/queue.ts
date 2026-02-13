/**
 * PostgreSQL-backed job queue.
 * Provides enqueue, poll, and process functions for background jobs.
 * The worker process calls pollAndProcess() on an interval.
 */
import { getDb } from "../db";
import { backgroundJobs } from "../../drizzle/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import type { BackgroundJob } from "../../drizzle/schema";

export type JobHandler = (payload: Record<string, unknown>) => Promise<Record<string, unknown> | void>;

// Registry of job type -> handler function
const jobHandlers = new Map<string, JobHandler>();

/**
 * Register a handler for a specific job type.
 */
export function registerJobHandler(type: string, handler: JobHandler): void {
  jobHandlers.set(type, handler);
}

/**
 * Enqueue a new background job.
 */
export async function enqueueJob(
  type: string,
  payload: Record<string, unknown>,
  options?: { scheduledAt?: Date; maxAttempts?: number }
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.insert(backgroundJobs).values({
    type,
    status: "pending",
    payload,
    scheduledAt: options?.scheduledAt ?? new Date(),
    maxAttempts: options?.maxAttempts ?? 3,
  }).returning();

  console.log(`[Jobs] Enqueued job #${rows[0].id} (${type})`);
  return rows[0].id;
}

/**
 * Claim and process a single pending job. Returns true if a job was processed.
 * Uses SELECT ... FOR UPDATE SKIP LOCKED for safe concurrent access.
 */
export async function pollAndProcess(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Claim a pending job that is due to run
  const claimedRows = await db.execute(
    sql`UPDATE "backgroundJobs"
        SET status = 'running', "startedAt" = NOW(), attempts = attempts + 1
        WHERE id = (
          SELECT id FROM "backgroundJobs"
          WHERE status = 'pending'
            AND "scheduledAt" <= NOW()
          ORDER BY "scheduledAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *`
  );

  const rows = (claimedRows.rows || claimedRows) as BackgroundJob[];
  if (!rows || rows.length === 0) return false;

  const job = rows[0];
  console.log(`[Jobs] Processing job #${job.id} (${job.type}), attempt ${job.attempts}`);

  const handler = jobHandlers.get(job.type);
  if (!handler) {
    console.error(`[Jobs] No handler registered for job type: ${job.type}`);
    await db.update(backgroundJobs)
      .set({
        status: "failed",
        errorMessage: `No handler registered for job type: ${job.type}`,
        completedAt: new Date(),
      })
      .where(eq(backgroundJobs.id, job.id));
    return true;
  }

  try {
    const result = await handler(job.payload);
    await db.update(backgroundJobs)
      .set({
        status: "completed",
        result: result ?? {},
        completedAt: new Date(),
      })
      .where(eq(backgroundJobs.id, job.id));
    console.log(`[Jobs] Job #${job.id} completed successfully`);
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    const shouldRetry = job.attempts < job.maxAttempts;

    await db.update(backgroundJobs)
      .set({
        status: shouldRetry ? "pending" : "failed",
        errorMessage,
        completedAt: shouldRetry ? undefined : new Date(),
        // Exponential backoff: 30s, 2min, 8min
        scheduledAt: shouldRetry
          ? new Date(Date.now() + Math.pow(4, job.attempts) * 30000)
          : undefined,
      })
      .where(eq(backgroundJobs.id, job.id));

    console.error(`[Jobs] Job #${job.id} failed: ${errorMessage}${shouldRetry ? " (will retry)" : " (giving up)"}`);
  }

  return true;
}

/**
 * Start the polling loop. Called by the worker process.
 */
export async function startWorkerLoop(intervalMs: number = 5000): Promise<void> {
  console.log(`[Worker] Starting job polling loop (interval: ${intervalMs}ms)`);

  const poll = async () => {
    try {
      // Process multiple jobs per cycle if available
      let processed = true;
      while (processed) {
        processed = await pollAndProcess();
      }
    } catch (error) {
      console.error("[Worker] Error in poll cycle:", error);
    }
  };

  // Initial poll
  await poll();

  // Continue polling
  setInterval(poll, intervalMs);
}
