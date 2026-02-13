import { protectedProcedure, adminProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import { backgroundJobs } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const jobsRouter = router({
  /** List background jobs with optional status filter */
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
      type: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input?.status) conditions.push(eq(backgroundJobs.status, input.status));
      if (input?.type) conditions.push(eq(backgroundJobs.type, input.type));

      if (conditions.length > 0) {
        return db.select().from(backgroundJobs)
          .where(and(...conditions))
          .orderBy(desc(backgroundJobs.createdAt))
          .limit(input?.limit ?? 50);
      }

      return db.select().from(backgroundJobs)
        .orderBy(desc(backgroundJobs.createdAt))
        .limit(input?.limit ?? 50);
    }),

  /** Get job by ID */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(backgroundJobs).where(eq(backgroundJobs.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  /** Cancel a pending or running job */
  cancel: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(backgroundJobs)
        .set({ status: "cancelled", completedAt: new Date() })
        .where(and(
          eq(backgroundJobs.id, input.id),
          sql`${backgroundJobs.status} IN ('pending', 'running')`
        ));

      return { success: true };
    }),

  /** Get job queue stats */
  stats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { pending: 0, running: 0, completed: 0, failed: 0 };

    const results = await db.select({
      status: backgroundJobs.status,
      count: sql<number>`count(*)::int`,
    }).from(backgroundJobs).groupBy(backgroundJobs.status);

    const stats: Record<string, number> = { pending: 0, running: 0, completed: 0, failed: 0, cancelled: 0 };
    for (const row of results) {
      stats[row.status] = row.count;
    }

    return stats;
  }),
});
