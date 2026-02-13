import { adminProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import { workflows, workflowEnrollments, emailTemplates, emailSends, leads } from "../../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { enrollLead, cancelEnrollment, refreshWorkflowMetrics } from "../automation/workflowEngine";

export const automationRouter = router({
  // ─── WORKFLOWS ────────────────────────────────────────────────────────

  /** Create a new workflow */
  createWorkflow: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      trigger: z.enum([
        "lead_created", "assessment_completed", "workshop_registered",
        "proposal_generated", "proposal_viewed", "deal_stage_changed",
        "deal_closed_won", "deal_closed_lost", "manual",
      ]),
      triggerConditions: z.record(z.string(), z.unknown()).optional(),
      steps: z.array(z.object({
        stepNumber: z.number(),
        type: z.enum(["email", "wait", "condition", "tag", "webhook", "notify"]),
        config: z.record(z.string(), z.unknown()),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(workflows).values({
        name: input.name,
        description: input.description,
        trigger: input.trigger,
        triggerConditions: input.triggerConditions,
        steps: input.steps || [],
      }).returning();

      return rows[0];
    }),

  /** Update a workflow */
  updateWorkflow: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      trigger: z.enum([
        "lead_created", "assessment_completed", "workshop_registered",
        "proposal_generated", "proposal_viewed", "deal_stage_changed",
        "deal_closed_won", "deal_closed_lost", "manual",
      ]).optional(),
      triggerConditions: z.record(z.string(), z.unknown()).optional(),
      steps: z.array(z.object({
        stepNumber: z.number(),
        type: z.enum(["email", "wait", "condition", "tag", "webhook", "notify"]),
        config: z.record(z.string(), z.unknown()),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...fields } = input;
      await db.update(workflows).set({ ...fields, updatedAt: new Date() }).where(eq(workflows.id, id));

      const rows = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
      return rows[0];
    }),

  /** Activate a workflow */
  activateWorkflow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(workflows).set({ status: "active", updatedAt: new Date() })
        .where(eq(workflows.id, input.id));
      return { activated: true };
    }),

  /** Pause a workflow */
  pauseWorkflow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(workflows).set({ status: "paused", updatedAt: new Date() })
        .where(eq(workflows.id, input.id));
      return { paused: true };
    }),

  /** Archive a workflow */
  archiveWorkflow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(workflows).set({ status: "archived", updatedAt: new Date() })
        .where(eq(workflows.id, input.id));
      return { archived: true };
    }),

  /** List all workflows */
  listWorkflows: protectedProcedure
    .input(z.object({ includeArchived: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      if (input?.includeArchived) {
        return db.select().from(workflows).orderBy(desc(workflows.createdAt));
      }

      return db.select().from(workflows)
        .where(sql`${workflows.status} != 'archived'`)
        .orderBy(desc(workflows.createdAt));
    }),

  /** Get a workflow by ID */
  getWorkflow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      await refreshWorkflowMetrics(input.id);

      const rows = await db.select().from(workflows).where(eq(workflows.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  /** Manually enroll a lead in a workflow */
  enrollLead: adminProcedure
    .input(z.object({
      workflowId: z.number(),
      leadId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const enrollmentId = await enrollLead(input.workflowId, input.leadId);
      return { enrollmentId };
    }),

  /** Cancel an enrollment */
  cancelEnrollment: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await cancelEnrollment(input.id);
      return { cancelled: true };
    }),

  /** List enrollments for a workflow */
  listEnrollments: protectedProcedure
    .input(z.object({
      workflowId: z.number().optional(),
      leadId: z.number().optional(),
      status: z.string().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input.workflowId) conditions.push(eq(workflowEnrollments.workflowId, input.workflowId));
      if (input.leadId) conditions.push(eq(workflowEnrollments.leadId, input.leadId));
      if (input.status) conditions.push(sql`${workflowEnrollments.status} = ${input.status}`);

      const query = db.select({
        enrollment: workflowEnrollments,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadEmail: leads.email,
      })
        .from(workflowEnrollments)
        .leftJoin(leads, eq(workflowEnrollments.leadId, leads.id))
        .orderBy(desc(workflowEnrollments.createdAt))
        .limit(input.limit ?? 50);

      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }
      return query;
    }),

  // ─── EMAIL TEMPLATES ──────────────────────────────────────────────────

  /** Create an email template */
  createTemplate: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      htmlBody: z.string().min(1),
      textBody: z.string().optional(),
      variables: z.array(z.string()).optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(emailTemplates).values(input).returning();
      return rows[0];
    }),

  /** Update an email template */
  updateTemplate: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      subject: z.string().optional(),
      htmlBody: z.string().optional(),
      textBody: z.string().optional(),
      variables: z.array(z.string()).optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...fields } = input;
      await db.update(emailTemplates).set({ ...fields, updatedAt: new Date() })
        .where(eq(emailTemplates.id, id));

      const rows = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
      return rows[0];
    }),

  /** Delete an email template */
  deleteTemplate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(emailTemplates).where(eq(emailTemplates.id, input.id));
      return { deleted: true };
    }),

  /** List email templates */
  listTemplates: protectedProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      if (input?.category) {
        return db.select().from(emailTemplates)
          .where(eq(emailTemplates.category, input.category))
          .orderBy(desc(emailTemplates.updatedAt));
      }
      return db.select().from(emailTemplates).orderBy(desc(emailTemplates.updatedAt));
    }),

  /** Get a template by ID */
  getTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(emailTemplates).where(eq(emailTemplates.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  // ─── EMAIL ANALYTICS ──────────────────────────────────────────────────

  /** Get email send analytics */
  getEmailAnalytics: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return null;

      const stats = await db.select({
        total: sql<number>`count(*)::int`,
        sent: sql<number>`count(*) filter (where ${emailSends.status} IN ('sent', 'delivered', 'opened', 'clicked'))`,
        delivered: sql<number>`count(*) filter (where ${emailSends.status} IN ('delivered', 'opened', 'clicked'))`,
        opened: sql<number>`count(*) filter (where ${emailSends.status} IN ('opened', 'clicked'))`,
        clicked: sql<number>`count(*) filter (where ${emailSends.status} = 'clicked')`,
        bounced: sql<number>`count(*) filter (where ${emailSends.status} = 'bounced')`,
        failed: sql<number>`count(*) filter (where ${emailSends.status} = 'failed')`,
        unsubscribed: sql<number>`count(*) filter (where ${emailSends.unsubscribed} = 1)`,
      }).from(emailSends);

      return stats[0];
    }),

  /** List recent email sends */
  listEmailSends: protectedProcedure
    .input(z.object({
      leadId: z.number().optional(),
      enrollmentId: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input?.leadId) conditions.push(eq(emailSends.leadId, input.leadId));
      if (input?.enrollmentId) conditions.push(eq(emailSends.enrollmentId, input.enrollmentId));

      const query = db.select({
        send: emailSends,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadEmail: leads.email,
      })
        .from(emailSends)
        .leftJoin(leads, eq(emailSends.leadId, leads.id))
        .orderBy(desc(emailSends.createdAt))
        .limit(input?.limit ?? 50);

      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }
      return query;
    }),
});
