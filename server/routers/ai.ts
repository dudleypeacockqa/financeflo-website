import { adminProcedure, router } from "../trpc";
import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const aiRouter = router({
  /** AI Chat with RAG context and optional CRM entity */
  chat: adminProcedure
    .input(
      z.object({
        messages: z.array(chatMessageSchema).min(1),
        entityType: z.enum(["lead", "deal", "project"]).optional(),
        entityId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { chat } = await import("../ai/chat");
      return chat({
        messages: input.messages,
        entityType: input.entityType,
        entityId: input.entityId,
      });
    }),

  /** Generate meeting prep briefing for a deal */
  meetingPrep: adminProcedure
    .input(z.object({ dealId: z.number() }))
    .mutation(async ({ input }) => {
      const { generateMeetingPrep } = await import("../ai/meetingPrep");
      return generateMeetingPrep(input.dealId);
    }),

  /** Generate content grounded in knowledge base */
  generateContent: adminProcedure
    .input(
      z.object({
        contentType: z.enum(["blog_post", "linkedin_post", "email_sequence", "case_study_outline"]),
        topic: z.string().min(1),
        tone: z.enum(["professional", "conversational", "educational"]).optional(),
        length: z.enum(["short", "medium", "long"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { generateContent } = await import("../ai/contentGenerator");
      return generateContent({
        contentType: input.contentType,
        topic: input.topic,
        tone: input.tone ?? "professional",
        length: input.length ?? "medium",
      });
    }),
});
