import { adminProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  leads, leadResearch, leadResearchBatches, leadLists, leadListMembers,
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { enqueueJob } from "../jobs/queue";
import { createAndStartBatch, getLeadIdsFromList } from "../leadgen/batch";

export const leadgenRouter = router({
  /** Kick off research for a single lead */
  researchLead: adminProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ input }) => {
      const jobId = await enqueueJob("research_lead", { leadId: input.leadId });
      return { jobId, message: `Research queued for lead #${input.leadId}` };
    }),

  /** Get research results for a lead */
  getResearch: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(leadResearch)
        .where(eq(leadResearch.leadId, input.leadId))
        .orderBy(desc(leadResearch.createdAt))
        .limit(1);
      return rows[0] ?? null;
    }),

  /** List all research entries */
  listResearch: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(leadResearch)
        .orderBy(desc(leadResearch.createdAt))
        .limit(input?.limit ?? 50);
    }),

  // ─── BATCH OPERATIONS ──────────────────────────────────────────────────

  /** Create a new batch */
  createBatch: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      listId: z.number().optional(),
      leadIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(leadResearchBatches).values({
        name: input.name,
        status: "draft",
        listId: input.listId,
      }).returning();

      return rows[0];
    }),

  /** Start a batch */
  startBatch: adminProcedure
    .input(z.object({ batchId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const batchRows = await db.select().from(leadResearchBatches).where(eq(leadResearchBatches.id, input.batchId)).limit(1);
      if (batchRows.length === 0) throw new Error("Batch not found");
      const batch = batchRows[0];

      // Get lead IDs from list or use all leads
      let leadIds: number[];
      if (batch.listId) {
        leadIds = await getLeadIdsFromList(batch.listId);
      } else {
        // Use all leads that haven't been researched
        const unleadRows = await db.select({ id: leads.id }).from(leads)
          .where(eq(leads.researchStatus, "none"))
          .limit(100);
        leadIds = unleadRows.map(r => r.id);
      }

      if (leadIds.length === 0) {
        throw new Error("No leads to process in this batch");
      }

      await createAndStartBatch(input.batchId, leadIds);
      return { leadCount: leadIds.length };
    }),

  /** List batches */
  listBatches: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(leadResearchBatches)
        .orderBy(desc(leadResearchBatches.createdAt))
        .limit(input?.limit ?? 20);
    }),

  /** Get batch by ID */
  getBatch: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(leadResearchBatches).where(eq(leadResearchBatches.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  // ─── LEAD LISTS ────────────────────────────────────────────────────────

  /** Create a lead list */
  createList: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const rows = await db.insert(leadLists).values(input).returning();
      return rows[0];
    }),

  /** List all lead lists */
  listLists: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(leadLists).orderBy(desc(leadLists.createdAt));
  }),

  /** Add leads to a list */
  addToList: adminProcedure
    .input(z.object({
      listId: z.number(),
      leadIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const values = input.leadIds.map(leadId => ({
        listId: input.listId,
        leadId,
      }));

      await db.insert(leadListMembers).values(values).onConflictDoNothing();

      // Update member count
      const countResult = await db.select({ count: sql<number>`count(*)::int` })
        .from(leadListMembers)
        .where(eq(leadListMembers.listId, input.listId));

      await db.update(leadLists).set({
        memberCount: countResult[0]?.count ?? 0,
        updatedAt: new Date(),
      }).where(eq(leadLists.id, input.listId));

      return { added: input.leadIds.length };
    }),

  /** Get members of a list */
  getListMembers: protectedProcedure
    .input(z.object({ listId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db.select({
        memberId: leadListMembers.id,
        leadId: leads.id,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        company: leads.company,
        researchStatus: leads.researchStatus,
        addedAt: leadListMembers.addedAt,
      })
        .from(leadListMembers)
        .innerJoin(leads, eq(leadListMembers.leadId, leads.id))
        .where(eq(leadListMembers.listId, input.listId));
    }),

  // ─── CSV IMPORT ────────────────────────────────────────────────────────

  /** Import leads from CSV data */
  importLeads: adminProcedure
    .input(z.object({
      leads: z.array(z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        company: z.string().optional(),
        jobTitle: z.string().optional(),
        linkedinUrl: z.string().optional(),
        industry: z.string().optional(),
        companySize: z.string().optional(),
        companyWebsite: z.string().optional(),
      })),
      listId: z.number().optional(),
      source: z.enum(["quiz", "lead_magnet", "workshop", "contact", "referral", "linkedin"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let imported = 0;
      let skipped = 0;
      const importedIds: number[] = [];

      for (const lead of input.leads) {
        // Check for duplicate by email
        const existing = await db.select({ id: leads.id }).from(leads).where(eq(leads.email, lead.email)).limit(1);
        if (existing.length > 0) {
          skipped++;
          importedIds.push(existing[0].id);
          continue;
        }

        const rows = await db.insert(leads).values({
          ...lead,
          source: input.source || "linkedin",
        }).returning();

        imported++;
        importedIds.push(rows[0].id);
      }

      // Add to list if specified
      if (input.listId && importedIds.length > 0) {
        const values = importedIds.map(leadId => ({
          listId: input.listId!,
          leadId,
        }));
        await db.insert(leadListMembers).values(values).onConflictDoNothing();

        const countResult = await db.select({ count: sql<number>`count(*)::int` })
          .from(leadListMembers)
          .where(eq(leadListMembers.listId, input.listId));

        await db.update(leadLists).set({
          memberCount: countResult[0]?.count ?? 0,
          updatedAt: new Date(),
        }).where(eq(leadLists.id, input.listId));
      }

      return { imported, skipped, total: input.leads.length };
    }),
});
