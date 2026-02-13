/**
 * AI Chat engine: RAG-powered conversational assistant with optional CRM context.
 */
import { invokeLLMChat } from "../llm";
import { searchKnowledge, type SearchResult } from "../knowledge/search";
import { getDb } from "../db";
import { leads, deals, projects } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSource {
  documentTitle: string;
  chunkIndex: number;
  similarity?: number;
}

export interface ChatResponse {
  reply: string;
  sources: ChatSource[];
}

interface CrmContext {
  type: "lead" | "deal" | "project";
  id: number;
  summary: string;
}

const SYSTEM_PROMPT = `You are FinanceFlo's AI assistant. You have access to the company's knowledge base (frameworks, methodologies, pricing, case studies) and optionally CRM data (leads, deals, projects).

Guidelines:
- Answer based on the provided knowledge base context when available
- If CRM context is provided, incorporate it into your answers
- Cite source documents when referencing specific knowledge (e.g. "[Source: AIBA 4 Engines]")
- Be specific, practical, and actionable
- If the context doesn't contain enough information, say so clearly
- Use FinanceFlo's terminology: AIBA, ADAPT, CKPS, Connected Intelligence
- Be concise but thorough`;

/**
 * Process a chat message with RAG context and optional CRM entity injection.
 */
export async function chat(params: {
  messages: ChatMessage[];
  entityType?: "lead" | "deal" | "project";
  entityId?: number;
}): Promise<ChatResponse> {
  const { messages, entityType, entityId } = params;

  // Get the latest user message for KB search
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return { reply: "Please send a message to start the conversation.", sources: [] };
  }

  // Search KB for relevant context
  const kbResults = await searchKnowledge(lastUserMessage.content, 5);

  // Optionally load CRM entity context
  let crmContext: CrmContext | null = null;
  if (entityType && entityId) {
    crmContext = await loadCrmContext(entityType, entityId);
  }

  // Build the full system prompt with context
  const contextSections: string[] = [SYSTEM_PROMPT];

  if (kbResults.length > 0) {
    const kbSection = kbResults
      .map(
        (r, i) =>
          `[Source ${i + 1}: ${r.documentTitle}, chunk ${r.chunkIndex}${r.similarity ? ` (${(r.similarity * 100).toFixed(0)}% match)` : ""}]\n${r.content}`
      )
      .join("\n\n---\n\n");
    contextSections.push(`\nKNOWLEDGE BASE CONTEXT:\n${kbSection}`);
  }

  if (crmContext) {
    contextSections.push(`\nCRM CONTEXT (${crmContext.type} #${crmContext.id}):\n${crmContext.summary}`);
  }

  const fullSystemPrompt = contextSections.join("\n\n");

  const reply = await invokeLLMChat({
    systemPrompt: fullSystemPrompt,
    messages,
    maxTokens: 2048,
  });

  return {
    reply,
    sources: kbResults.map((r) => ({
      documentTitle: r.documentTitle,
      chunkIndex: r.chunkIndex,
      similarity: r.similarity,
    })),
  };
}

async function loadCrmContext(type: "lead" | "deal" | "project", id: number): Promise<CrmContext | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    if (type === "lead") {
      const rows = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
      if (rows.length === 0) return null;
      const lead = rows[0];
      return {
        type: "lead",
        id,
        summary: `Lead: ${lead.firstName} ${lead.lastName}, ${lead.jobTitle ?? "N/A"} at ${lead.company ?? "N/A"}. Industry: ${lead.industry ?? "N/A"}. Size: ${lead.companySize ?? "N/A"}. Source: ${lead.source ?? "N/A"}.`,
      };
    }

    if (type === "deal") {
      const rows = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
      if (rows.length === 0) return null;
      const deal = rows[0];
      return {
        type: "deal",
        id,
        summary: `Deal: "${deal.title}". Stage: ${deal.stage}. Value: ${deal.value ?? "N/A"}. Lead ID: ${deal.leadId}. Close date: ${deal.expectedCloseDate ?? "N/A"}.${deal.notes ? ` Notes: ${deal.notes}` : ""}`,
      };
    }

    if (type === "project") {
      const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      if (rows.length === 0) return null;
      const project = rows[0];
      return {
        type: "project",
        id,
        summary: `Project: "${project.name}". Status: ${project.status}. Contract value: ${project.contractValue ?? "N/A"}. Phase: ${project.currentPhase}. Start: ${project.startDate ?? "N/A"}. Target end: ${project.targetEndDate ?? "N/A"}.${project.description ? ` Description: ${project.description}` : ""}`,
      };
    }
  } catch (error: any) {
    console.error(`[AIChat] Failed to load CRM context for ${type} #${id}:`, error.message);
  }

  return null;
}
