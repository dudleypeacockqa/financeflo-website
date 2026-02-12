import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { systemRouter } from "./systemRouter";
import { publicProcedure, protectedProcedure, router } from "./trpc";
import { z } from "zod";
import {
  createLead, getLeadById, getLeadByEmail, listLeads, updateLeadGhlId,
  createAssessment, getAssessmentById, getAssessmentsByLeadId, markAssessmentProposalGenerated,
  createProposal, getProposalById, getProposalsByLeadId, updateProposalStatus, updateProposalPdfUrl,
  createWorkshopRegistration, getWorkshopRegistrationsByWorkshopId, updateWorkshopStatus,
  listAssessments, listProposals, listWorkshopRegistrations, listWebhookEvents,
  logWebhookEvent,
} from "./db";
import { sendToGHL } from "./ghl";
import { generateProposalContent } from "./proposalGenerator";
import { generateAndUploadProposal } from "./pdfGenerator";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── LEAD CAPTURE ───────────────────────────────────────────────────────
  lead: router({
    create: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        company: z.string().optional(),
        jobTitle: z.string().optional(),
        phone: z.string().optional(),
        linkedinUrl: z.string().optional(),
        companySize: z.string().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
        source: z.enum(["quiz", "lead_magnet", "workshop", "contact", "referral", "linkedin"]),
        tags: z.array(z.string()).optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Check if lead already exists by email
        const existing = await getLeadByEmail(input.email);
        if (existing) return existing;

        const lead = await createLead(input);

        // Fire GHL webhook asynchronously (don't block response)
        sendToGHL("lead_created", {
          leadId: lead.id,
          ...input,
        }).catch(err => console.error("[GHL] Failed to send lead:", err));

        return lead;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLeadById(input.id);
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return listLeads(input?.limit ?? 50);
      }),
  }),

  // ─── ASSESSMENT QUIZ ──────────────────────────────────────────────────────
  assessment: router({
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

        // Fire GHL webhook
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
  }),

  // ─── PROPOSAL GENERATION ──────────────────────────────────────────────────
  proposal: router({
    generate: publicProcedure
      .input(z.object({
        leadId: z.number(),
        assessmentId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const lead = await getLeadById(input.leadId);
        const assessment = await getAssessmentById(input.assessmentId);
        if (!lead || !assessment) throw new Error("Lead or assessment not found");

        // Generate proposal content using LLM
        const proposalContent = await generateProposalContent(lead, assessment);

        const proposal = await createProposal({
          leadId: input.leadId,
          assessmentId: input.assessmentId,
          title: proposalContent.title,
          content: proposalContent as unknown as Record<string, unknown>,
          status: "draft",
          estimatedValue: proposalContent.estimatedValue,
        });

        // Mark assessment as having a proposal
        await markAssessmentProposalGenerated(input.assessmentId);

        // Fire GHL webhook
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
  }),

  // ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────
  admin: router({
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
  }),

  // ─── WORKSHOP REGISTRATION ────────────────────────────────────────────────
  workshop: router({
    register: publicProcedure
      .input(z.object({
        leadId: z.number(),
        workshopId: z.string(),
        workshopTitle: z.string(),
      }))
      .mutation(async ({ input }) => {
        const reg = await createWorkshopRegistration({
          leadId: input.leadId,
          workshopId: input.workshopId,
          workshopTitle: input.workshopTitle,
        });

        // Fire GHL webhook
        sendToGHL("workshop_registered", {
          registrationId: reg.id,
          leadId: input.leadId,
          workshopId: input.workshopId,
          workshopTitle: input.workshopTitle,
        }).catch(err => console.error("[GHL] Failed to send workshop reg:", err));

        return reg;
      }),

    listByWorkshop: protectedProcedure
      .input(z.object({ workshopId: z.string() }))
      .query(async ({ input }) => {
        return getWorkshopRegistrationsByWorkshopId(input.workshopId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["registered", "confirmed", "attended", "no_show", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await updateWorkshopStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
