import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import {
  listLeads, listAssessments, listProposals,
  listWorkshopRegistrations, listWebhookEvents,
} from "../db";

export const adminRouter = router({
  dashboard: protectedProcedure.query(async () => {
    const [leadsList, assessmentsList, proposalsList, workshopList] = await Promise.all([
      listLeads(10),
      listAssessments(10),
      listProposals(10),
      listWorkshopRegistrations(10),
    ]);
    return {
      leads: { total: leadsList.length, recent: leadsList },
      assessments: { total: assessmentsList.length, recent: assessmentsList },
      proposals: { total: proposalsList.length, recent: proposalsList },
      workshops: { total: workshopList.length, recent: workshopList },
    };
  }),

  leads: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => listLeads(input?.limit ?? 100)),

  assessments: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => listAssessments(input?.limit ?? 100)),

  proposals: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => listProposals(input?.limit ?? 100)),

  workshops: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => listWorkshopRegistrations(input?.limit ?? 100)),

  webhookEvents: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => listWebhookEvents(input?.limit ?? 100)),
});
