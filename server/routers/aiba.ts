import { adminProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import { aibaAnalyses, leads, deals } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { runDiagnostic } from "../aiba/diagnostic";
import { generateReportData, renderReportHtml } from "../aiba/reportGenerator";

export const aibaRouter = router({
  /** Run an AIBA diagnostic from discovery notes */
  runDiagnostic: adminProcedure
    .input(z.object({
      dealId: z.number().optional(),
      leadId: z.number().optional(),
      notes: z.string().min(10),
      companyName: z.string().optional(),
      industry: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await runDiagnostic(input);

      // If there's a dealId, link the analysis to the deal
      if (input.dealId) {
        const db = await getDb();
        if (db) {
          await db.update(deals).set({
            aibaAnalysisId: result.analysisId,
            updatedAt: new Date(),
          }).where(eq(deals.id, input.dealId));
        }
      }

      return result;
    }),

  /** Get a single AIBA analysis */
  getAnalysis: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db.select({
        analysis: aibaAnalyses,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadCompany: leads.company,
      })
        .from(aibaAnalyses)
        .leftJoin(leads, eq(aibaAnalyses.leadId, leads.id))
        .where(eq(aibaAnalyses.id, input.id))
        .limit(1);

      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        ...row.analysis,
        lead: {
          firstName: row.leadFirstName,
          lastName: row.leadLastName,
          company: row.leadCompany,
        },
      };
    }),

  /** List AIBA analyses */
  listAnalyses: protectedProcedure
    .input(z.object({
      dealId: z.number().optional(),
      leadId: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input?.dealId) conditions.push(eq(aibaAnalyses.dealId, input.dealId));
      if (input?.leadId) conditions.push(eq(aibaAnalyses.leadId, input.leadId));

      const query = db.select({
        id: aibaAnalyses.id,
        dealId: aibaAnalyses.dealId,
        leadId: aibaAnalyses.leadId,
        constraintType: aibaAnalyses.constraintType,
        readinessScore: aibaAnalyses.readinessScore,
        costOfInaction: aibaAnalyses.costOfInaction,
        status: aibaAnalyses.status,
        createdAt: aibaAnalyses.createdAt,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadCompany: leads.company,
      })
        .from(aibaAnalyses)
        .leftJoin(leads, eq(aibaAnalyses.leadId, leads.id))
        .orderBy(desc(aibaAnalyses.createdAt))
        .limit(input?.limit ?? 50);

      if (conditions.length > 0) {
        return query.where(conditions.length === 1 ? conditions[0] : undefined);
      }

      return query;
    }),

  /** Generate report data for an analysis */
  getReportData: protectedProcedure
    .input(z.object({ analysisId: z.number() }))
    .query(async ({ input }) => {
      return generateReportData(input.analysisId);
    }),

  /** Generate HTML report */
  generateReportHtml: adminProcedure
    .input(z.object({ analysisId: z.number() }))
    .mutation(async ({ input }) => {
      const data = await generateReportData(input.analysisId);
      const html = renderReportHtml(data);
      return { html, data };
    }),
});
