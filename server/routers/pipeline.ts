import { adminProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import { deals, activities, salesTasks, leads } from "../../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { createDeal, moveDealStage, getPipelineOverview } from "../pipeline/dealManager";
import { logActivity, logNote, logCall, logMeeting } from "../pipeline/activityLogger";

export const pipelineRouter = router({
  /** Create a deal from a lead */
  createDeal: adminProcedure
    .input(z.object({
      leadId: z.number(),
      title: z.string().min(1),
      value: z.number().optional(),
      assignedTo: z.string().optional(),
      stage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return createDeal(input);
    }),

  /** Get a deal by ID with lead info */
  getDeal: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db.select({
        deal: deals,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadEmail: leads.email,
        leadCompany: leads.company,
      })
        .from(deals)
        .leftJoin(leads, eq(deals.leadId, leads.id))
        .where(eq(deals.id, input.id))
        .limit(1);

      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        ...row.deal,
        lead: {
          firstName: row.leadFirstName,
          lastName: row.leadLastName,
          email: row.leadEmail,
          company: row.leadCompany,
        },
      };
    }),

  /** List deals with optional filters */
  listDeals: protectedProcedure
    .input(z.object({
      stage: z.string().optional(),
      assignedTo: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input?.stage) conditions.push(eq(deals.stage, input.stage as any));
      if (input?.assignedTo) conditions.push(eq(deals.assignedTo, input.assignedTo));

      const query = db.select({
        deal: deals,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadCompany: leads.company,
      })
        .from(deals)
        .leftJoin(leads, eq(deals.leadId, leads.id))
        .orderBy(desc(deals.updatedAt))
        .limit(input?.limit ?? 100);

      const rows = conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

      return rows.map((r) => ({
        ...r.deal,
        lead: {
          firstName: r.leadFirstName,
          lastName: r.leadLastName,
          company: r.leadCompany,
        },
      }));
    }),

  /** Move a deal to a new stage */
  moveStage: adminProcedure
    .input(z.object({
      dealId: z.number(),
      newStage: z.string(),
      lossReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await moveDealStage(input.dealId, input.newStage, input.lossReason);
      return { moved: true };
    }),

  /** Update deal fields */
  updateDeal: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      value: z.number().optional(),
      assignedTo: z.string().optional(),
      expectedCloseDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, expectedCloseDate, ...fields } = input;
      const update: Record<string, unknown> = { ...fields, updatedAt: new Date() };
      if (expectedCloseDate) update.expectedCloseDate = new Date(expectedCloseDate);

      await db.update(deals).set(update).where(eq(deals.id, id));

      const rows = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
      return rows[0];
    }),

  /** Get pipeline overview */
  overview: protectedProcedure
    .query(async () => {
      return getPipelineOverview();
    }),

  // ─── ACTIVITIES ──────────────────────────────────────────────────────

  /** Add an activity to a deal */
  addActivity: adminProcedure
    .input(z.object({
      dealId: z.number(),
      type: z.enum(["note", "call", "meeting", "email", "stage_change", "task_completed"]),
      description: z.string().min(1),
      metadata: z.record(z.string(), z.unknown()).optional(),
      performedBy: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await logActivity(input);
      return { id };
    }),

  /** Get activities for a deal */
  getActivities: protectedProcedure
    .input(z.object({
      dealId: z.number(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(activities)
        .where(eq(activities.dealId, input.dealId))
        .orderBy(desc(activities.createdAt))
        .limit(input.limit ?? 50);
    }),

  // ─── SALES TASKS ─────────────────────────────────────────────────────

  /** Create a sales task */
  createTask: adminProcedure
    .input(z.object({
      dealId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      assignedTo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { dueDate, ...fields } = input;
      const rows = await db.insert(salesTasks).values({
        ...fields,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      }).returning();

      return rows[0];
    }),

  /** Complete a sales task */
  completeTask: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(salesTasks).set({
        completed: 1,
        completedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(salesTasks.id, input.id));

      // Log on the deal
      const rows = await db.select().from(salesTasks).where(eq(salesTasks.id, input.id)).limit(1);
      if (rows.length > 0) {
        await logActivity({
          dealId: rows[0].dealId,
          type: "task_completed",
          description: `Task completed: ${rows[0].title}`,
        });
      }

      return { completed: true };
    }),

  /** List tasks for a deal */
  listTasks: protectedProcedure
    .input(z.object({
      dealId: z.number(),
      includeCompleted: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(salesTasks.dealId, input.dealId)];
      if (!input.includeCompleted) {
        conditions.push(eq(salesTasks.completed, 0));
      }

      return db.select().from(salesTasks)
        .where(and(...conditions))
        .orderBy(salesTasks.dueDate);
    }),

  /** List all open tasks (across deals) */
  listAllTasks: protectedProcedure
    .input(z.object({
      assignedTo: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(salesTasks.completed, 0)];
      if (input?.assignedTo) conditions.push(eq(salesTasks.assignedTo, input.assignedTo));

      return db.select({
        task: salesTasks,
        dealTitle: deals.title,
        dealStage: deals.stage,
      })
        .from(salesTasks)
        .innerJoin(deals, eq(salesTasks.dealId, deals.id))
        .where(and(...conditions))
        .orderBy(salesTasks.dueDate)
        .limit(input?.limit ?? 50);
    }),
});
