import { publicProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { createLead, getLeadById, getLeadByEmail, listLeads } from "../db";
import { sendToGHL } from "../ghl";

export const leadRouter = router({
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
      const existing = await getLeadByEmail(input.email);
      if (existing) return existing;

      const lead = await createLead(input);

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
});
