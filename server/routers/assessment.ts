import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import {
  createAssessment,
  getAssessmentById,
  getAssessmentsByLeadId,
  getLeadById,
} from "../db";
import { sendToGHL } from "../ghl";
import {
  buildAssessmentAnswersText,
  buildAssessmentExecutiveSummary,
  buildAssessmentReportUrl,
  summarizeAssessmentAnswers,
} from "@shared/assessmentReport";
import { createAssessmentReportToken } from "../assessmentReportTokens";

function getRequestBaseUrl(
  req: { protocol?: string; headers?: Record<string, unknown> } | undefined
): string {
  if (!req?.headers) {
    return "";
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = forwardedHost || req.headers.host;
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0]?.trim()
      : req.protocol || "https";

  if (typeof host !== "string" || !host) {
    return "";
  }

  return `${protocol}://${host}`;
}

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
    .mutation(async ({ input, ctx }) => {
      const assessment = await createAssessment(input);
      const reportToken = createAssessmentReportToken(assessment.id);
      const reportPath = buildAssessmentReportUrl({
        token: reportToken,
        download: true,
      });
      const requestBaseUrl = getRequestBaseUrl(ctx.req);
      const reportUrl = requestBaseUrl
        ? `${requestBaseUrl}${reportPath}`
        : reportPath;

      const lead = await getLeadById(input.leadId);
      const answerSummary = summarizeAssessmentAnswers(input.answers);
      const payload: Record<string, unknown> = {
        assessmentId: assessment.id,
        leadId: input.leadId,
        answers: input.answers,
        answerSummary,
        answersText: buildAssessmentAnswersText(answerSummary),
        assessmentReportUrl: reportUrl,
        constraintScores: input.constraintScores,
        overallScore: input.overallScore,
        primaryConstraint: input.primaryConstraint,
        costOfInaction: input.costOfInaction,
        recommendedTier: input.recommendedTier,
        recommendedPhase: input.recommendedPhase,
        executiveSummary: buildAssessmentExecutiveSummary({
          companyName: lead?.company ?? undefined,
          costOfInaction: input.costOfInaction,
          overallScore: input.overallScore,
          primaryConstraint: input.primaryConstraint,
          recommendedTier: input.recommendedTier,
        }),
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

      return {
        ...assessment,
        reportUrl,
      };
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
