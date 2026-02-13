import { publicProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import {
  createProposal, getProposalById, getProposalsByLeadId,
  updateProposalStatus, updateProposalPdfUrl,
  getLeadById, getAssessmentById, markAssessmentProposalGenerated,
} from "../db";
import { sendToGHL } from "../ghl";
import { generateProposalContent } from "../proposalGenerator";
import { generateAndUploadProposal } from "../pdfGenerator";

export const proposalRouter = router({
  generate: publicProcedure
    .input(z.object({
      leadId: z.number(),
      assessmentId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const lead = await getLeadById(input.leadId);
      const assessment = await getAssessmentById(input.assessmentId);
      if (!lead || !assessment) throw new Error("Lead or assessment not found");

      const proposalContent = await generateProposalContent(lead, assessment);

      const proposal = await createProposal({
        leadId: input.leadId,
        assessmentId: input.assessmentId,
        title: proposalContent.title,
        content: proposalContent as unknown as Record<string, unknown>,
        status: "draft",
        estimatedValue: proposalContent.estimatedValue,
      });

      await markAssessmentProposalGenerated(input.assessmentId);

      sendToGHL("proposal_generated", {
        proposalId: proposal.id,
        leadId: input.leadId,
        assessmentId: input.assessmentId,
        title: proposalContent.title,
        estimatedValue: proposalContent.estimatedValue,
      }).catch(err => console.error("[GHL] Failed to send proposal:", err));

      return proposal;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getProposalById(input.id);
    }),

  getByLeadId: publicProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      return getProposalsByLeadId(input.leadId);
    }),

  generatePdf: publicProcedure
    .input(z.object({
      proposalId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const proposal = await getProposalById(input.proposalId);
      if (!proposal) throw new Error("Proposal not found");

      const lead = await getLeadById(proposal.leadId);
      const assessment = proposal.assessmentId ? await getAssessmentById(proposal.assessmentId) : null;
      if (!lead) throw new Error("Lead not found");

      const proposalContent = proposal.content as unknown as {
        title: string;
        executiveSummary: string;
        constraintDiagnosis: { primaryConstraint: string; constraintBreakdown: Record<string, number>; costOfInaction: number };
        recommendedSolution: { tier: string; description: string; deliverables: string[]; timeline: string };
        roiProjection: { year1Savings: number; year3Savings: number; roiMultiple: number; paybackMonths: number };
        pricingIndicative: { auditFee: string; implementationRange: string; monthlyRetainer: string };
        nextSteps: string[];
        estimatedValue: number;
      };

      const pdfUrl = await generateAndUploadProposal(
        lead,
        assessment || { constraintScores: {}, costOfInaction: 0, primaryConstraint: "unknown", overallScore: 0, recommendedTier: "audit" } as any,
        proposalContent
      );

      await updateProposalPdfUrl(input.proposalId, pdfUrl);

      return { pdfUrl };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "sent", "viewed", "accepted", "declined"]),
    }))
    .mutation(async ({ input }) => {
      await updateProposalStatus(input.id, input.status);
      return { success: true };
    }),
});
