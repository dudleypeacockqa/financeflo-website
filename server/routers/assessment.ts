import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { createAssessment, getAssessmentById, getAssessmentsByLeadId } from "../db";
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

      sendToGHL("assessment_completed", {
        assessmentId: assessment.id,
        leadId: input.leadId,
        overallScore: input.overallScore,
        primaryConstraint: input.primaryConstraint,
        costOfInaction: input.costOfInaction,
        recommendedTier: input.recommendedTier,
      }).catch(err => console.error("[GHL] Failed to send assessment:", err));

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
