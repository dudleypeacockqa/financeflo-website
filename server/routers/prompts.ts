import { adminProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import { promptTemplates } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { renderPrompt } from "../prompts/registry";
import { invokeLLM } from "../llm";

export const promptsRouter = router({
  /** List all prompt templates */
  list: protectedProcedure
    .input(z.object({
      category: z.enum(["lead_analysis", "dm_sequence", "proposal", "aiba_diagnostic", "research", "general"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      if (input?.category) {
        return db.select().from(promptTemplates)
          .where(eq(promptTemplates.category, input.category))
          .orderBy(desc(promptTemplates.updatedAt));
      }

      return db.select().from(promptTemplates).orderBy(desc(promptTemplates.updatedAt));
    }),

  /** Get a single prompt template */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(promptTemplates).where(eq(promptTemplates.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  /** Get prompt template by name */
  getByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(promptTemplates).where(eq(promptTemplates.name, input.name)).limit(1);
      return rows[0] ?? null;
    }),

  /** Create a new prompt template */
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["lead_analysis", "dm_sequence", "proposal", "aiba_diagnostic", "research", "general"]),
      description: z.string().optional(),
      systemPrompt: z.string().min(1),
      userPromptTemplate: z.string().min(1),
      model: z.string().optional(),
      maxTokens: z.number().optional(),
      temperature: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(promptTemplates).values({
        name: input.name,
        category: input.category,
        description: input.description,
        systemPrompt: input.systemPrompt,
        userPromptTemplate: input.userPromptTemplate,
        model: input.model ?? "claude-sonnet-4-5-20250929",
        maxTokens: input.maxTokens ?? 4096,
        temperature: input.temperature,
      }).returning();

      return rows[0];
    }),

  /** Update a prompt template */
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      systemPrompt: z.string().optional(),
      userPromptTemplate: z.string().optional(),
      model: z.string().optional(),
      maxTokens: z.number().optional(),
      temperature: z.string().optional(),
      isActive: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;
      const rows = await db.update(promptTemplates)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(promptTemplates.id, id))
        .returning();

      return rows[0];
    }),

  /** Delete a prompt template */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(promptTemplates).where(eq(promptTemplates.id, input.id));
      return { success: true };
    }),

  /** Test a prompt template with sample variables */
  test: adminProcedure
    .input(z.object({
      id: z.number(),
      variables: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.select().from(promptTemplates).where(eq(promptTemplates.id, input.id)).limit(1);
      if (rows.length === 0) throw new Error("Prompt template not found");

      const template = rows[0];
      const rendered = renderPrompt(template.userPromptTemplate, input.variables);

      const result = await invokeLLM({
        systemPrompt: template.systemPrompt,
        userPrompt: rendered,
        maxTokens: template.maxTokens,
      });

      return { rendered, result };
    }),
});
