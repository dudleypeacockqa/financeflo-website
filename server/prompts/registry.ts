/**
 * Prompt template registry: load from DB, render with variable interpolation.
 */
import { getDb } from "../db";
import { promptTemplates } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { PromptTemplate } from "../../drizzle/schema";

/**
 * Load an active prompt template by name.
 */
export async function getPromptByName(name: string): Promise<PromptTemplate | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.name, name), eq(promptTemplates.isActive, 1)))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Render a prompt template by replacing {{variable}} placeholders with values.
 * Uses Mustache-style double-brace interpolation.
 */
export function renderPrompt(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Load a prompt template by name and render it with the given variables.
 * Returns both the system prompt and rendered user prompt.
 */
export async function loadAndRenderPrompt(
  name: string,
  variables: Record<string, string>
): Promise<{ systemPrompt: string; userPrompt: string; model: string; maxTokens: number } | null> {
  const template = await getPromptByName(name);
  if (!template) return null;

  return {
    systemPrompt: template.systemPrompt,
    userPrompt: renderPrompt(template.userPromptTemplate, variables),
    model: template.model,
    maxTokens: template.maxTokens,
  };
}
