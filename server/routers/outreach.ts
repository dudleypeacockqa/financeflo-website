import { adminProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import { campaigns, outreachMessages, leads, leadListMembers } from "../../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import {
  scheduleCampaign,
  startCampaign,
  pauseCampaign,
  cancelCampaign,
  refreshCampaignMetrics,
} from "../outreach/campaignManager";
import { enqueueJob } from "../jobs/queue";

export const outreachRouter = router({
  /** Create a new campaign */
  createCampaign: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      channel: z.enum(["linkedin_dm", "linkedin_connection", "email"]),
      listId: z.number().optional(),
      sequenceSteps: z.array(z.object({
        stepNumber: z.number(),
        channel: z.string(),
        delayDays: z.number(),
        subject: z.string().optional(),
        templateBody: z.string(),
      })).optional(),
      settings: z.object({
        dailyLimit: z.number().default(50),
        sendWindowStart: z.string().default("09:00"),
        sendWindowEnd: z.string().default("17:00"),
        timezone: z.string().default("Europe/London"),
        skipWeekends: z.boolean().default(true),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(campaigns).values({
        name: input.name,
        channel: input.channel,
        listId: input.listId,
        sequenceSteps: input.sequenceSteps,
        settings: input.settings || {
          dailyLimit: 50,
          sendWindowStart: "09:00",
          sendWindowEnd: "17:00",
          timezone: "Europe/London",
          skipWeekends: true,
        },
      }).returning();

      return rows[0];
    }),

  /** Update campaign details (draft only) */
  updateCampaign: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      channel: z.enum(["linkedin_dm", "linkedin_connection", "email"]).optional(),
      listId: z.number().optional(),
      sequenceSteps: z.array(z.object({
        stepNumber: z.number(),
        channel: z.string(),
        delayDays: z.number(),
        subject: z.string().optional(),
        templateBody: z.string(),
      })).optional(),
      settings: z.object({
        dailyLimit: z.number(),
        sendWindowStart: z.string(),
        sendWindowEnd: z.string(),
        timezone: z.string(),
        skipWeekends: z.boolean(),
      }).optional(),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, scheduledAt, ...fields } = input;
      const updateData: Record<string, unknown> = {
        ...fields,
        updatedAt: new Date(),
      };
      if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);

      await db.update(campaigns).set(updateData)
        .where(and(eq(campaigns.id, id), eq(campaigns.status, "draft")));

      const rows = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
      return rows[0];
    }),

  /** Schedule a campaign (creates messages, transitions to scheduled) */
  scheduleCampaign: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return scheduleCampaign(input.id);
    }),

  /** Start a scheduled/paused campaign */
  startCampaign: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await startCampaign(input.id);
      // Enqueue a job to process due messages
      await enqueueJob("process_outreach", { campaignId: input.id });
      return { started: true };
    }),

  /** Pause a running campaign */
  pauseCampaign: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await pauseCampaign(input.id);
      return { paused: true };
    }),

  /** Cancel a campaign */
  cancelCampaign: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await cancelCampaign(input.id);
      return { cancelled: true };
    }),

  /** List all campaigns */
  listCampaigns: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(campaigns)
        .orderBy(desc(campaigns.createdAt))
        .limit(input?.limit ?? 50);
    }),

  /** Get campaign by ID */
  getCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(campaigns).where(eq(campaigns.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  /** Get messages for a campaign */
  getCampaignMessages: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      status: z.string().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(outreachMessages.campaignId, input.campaignId)];
      if (input.status) {
        conditions.push(sql`${outreachMessages.status} = ${input.status}`);
      }

      return db.select({
        id: outreachMessages.id,
        leadId: outreachMessages.leadId,
        stepNumber: outreachMessages.stepNumber,
        channel: outreachMessages.channel,
        status: outreachMessages.status,
        subject: outreachMessages.subject,
        personalizedBody: outreachMessages.personalizedBody,
        templateBody: outreachMessages.templateBody,
        errorMessage: outreachMessages.errorMessage,
        scheduledAt: outreachMessages.scheduledAt,
        sentAt: outreachMessages.sentAt,
        deliveredAt: outreachMessages.deliveredAt,
        openedAt: outreachMessages.openedAt,
        clickedAt: outreachMessages.clickedAt,
        repliedAt: outreachMessages.repliedAt,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadEmail: leads.email,
        leadCompany: leads.company,
      })
        .from(outreachMessages)
        .innerJoin(leads, eq(outreachMessages.leadId, leads.id))
        .where(and(...conditions))
        .orderBy(outreachMessages.stepNumber, outreachMessages.scheduledAt)
        .limit(input.limit ?? 100);
    }),

  /** Get campaign analytics summary */
  getCampaignAnalytics: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      // Refresh metrics first
      await refreshCampaignMetrics(input.campaignId);

      const campaignRows = await db.select().from(campaigns).where(eq(campaigns.id, input.campaignId)).limit(1);
      if (campaignRows.length === 0) return null;

      // Get per-step breakdown
      const stepBreakdown = await db
        .select({
          stepNumber: outreachMessages.stepNumber,
          total: count(),
          sent: sql<number>`count(*) filter (where ${outreachMessages.status} IN ('sent', 'delivered', 'opened', 'clicked', 'replied'))`,
          delivered: sql<number>`count(*) filter (where ${outreachMessages.status} IN ('delivered', 'opened', 'clicked', 'replied'))`,
          opened: sql<number>`count(*) filter (where ${outreachMessages.status} IN ('opened', 'clicked'))`,
          replied: sql<number>`count(*) filter (where ${outreachMessages.status} = 'replied')`,
          failed: sql<number>`count(*) filter (where ${outreachMessages.status} IN ('bounced', 'failed'))`,
        })
        .from(outreachMessages)
        .where(eq(outreachMessages.campaignId, input.campaignId))
        .groupBy(outreachMessages.stepNumber)
        .orderBy(outreachMessages.stepNumber);

      return {
        campaign: campaignRows[0],
        stepBreakdown,
      };
    }),

  /** Refresh metrics for a campaign */
  refreshMetrics: adminProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ input }) => {
      await refreshCampaignMetrics(input.campaignId);
      return { refreshed: true };
    }),
});
