import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import {
  createAssessment,
  getAssessmentById,
  getAssessmentsByLeadId,
  getLeadById,
} from "../db";
import { sendToGHL } from "../ghl";

export const assessmentRouter = router({
  submit: publicProcedure
    .input(z.object({
      leadId: z.number(),
      answers: z.record(z.string(), z.unknown()),
      constraintScores: z.record(z.string(), z.number()),
      overallScore: z.number(),
      primaryConstraint: z.string(),
      costOfInaction: z.number().optional(),
      recommendedTier: z.enum(["audit", "quick_wins", "implementation", "retainer"]),
      recommendedPhase: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const assessment = await createAssessment(input);

      const lead = await getLeadById(input.leadId);
      const payload: Record<string, unknown> = {
        assessmentId: assessment.id,
        leadId: input.leadId,
        overallScore: input.overallScore,
        primaryConstraint: input.primaryConstraint,
        costOfInaction: input.costOfInaction,
        recommendedTier: input.recommendedTier,
      };
      if (lead) {
        payload.ghlContactId = lead.ghlContactId ?? undefined;
        payload.email = lead.email;
        payload.firstName = lead.firstName;
        payload.lastName = lead.lastName;
        payload.company = lead.company ?? undefined;
        payload.phone = lead.phone ?? undefined;
        payload.jobTitle = lead.jobTitle ?? undefined;
        payload.companySize = lead.companySize ?? undefined;
      }

      sendToGHL("assessment_completed", payload).catch((err) =>
        console.error("[GHL] Failed to send assessment:", err)
      );

      return assessment;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getAssessmentById(input.id);
    }),

  getByLeadId: publicProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      return getAssessmentsByLeadId(input.leadId);
    }),
});
