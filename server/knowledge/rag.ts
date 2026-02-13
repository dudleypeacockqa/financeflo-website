/**
 * RAG pipeline: query -> embed -> search -> build context -> Claude
 */
import { searchKnowledge, type SearchResult } from "./search";
import { invokeLLM } from "../llm";

export interface RagResponse {
  answer: string;
  sources: { documentTitle: string; chunkIndex: number; similarity?: number }[];
  tokensUsed: number;
}

/**
 * Query the knowledge base with RAG: retrieve relevant chunks, build context,
 * and generate an answer using Claude.
 */
export async function queryWithRag(query: string, maxChunks: number = 5): Promise<RagResponse> {
  // Step 1: Search for relevant knowledge chunks
  const searchResults = await searchKnowledge(query, maxChunks);

  if (searchResults.length === 0) {
    return {
      answer: "No relevant information found in the knowledge base for this query.",
      sources: [],
      tokensUsed: 0,
    };
  }

  // Step 2: Build context from search results
  const context = buildContext(searchResults);

  // Step 3: Generate answer using Claude with RAG context
  const systemPrompt = `You are FinanceFlo's AI assistant with access to the company's knowledge base. Answer the user's question based on the provided context. If the context doesn't contain enough information to fully answer the question, say so clearly. Always be specific and cite the source documents when possible.`;

  const userPrompt = `Context from knowledge base:
---
${context}
---

Question: ${query}

Please provide a comprehensive answer based on the context above.`;

  const answer = await invokeLLM({
    systemPrompt,
    userPrompt,
    maxTokens: 2048,
  });

  return {
    answer,
    sources: searchResults.map(r => ({
      documentTitle: r.documentTitle,
      chunkIndex: r.chunkIndex,
      similarity: r.similarity,
    })),
    tokensUsed: context.length / 4, // Rough estimate
  };
}

function buildContext(results: SearchResult[]): string {
  return results
    .map((result, i) => {
      const similarityStr = result.similarity
        ? ` (relevance: ${(result.similarity * 100).toFixed(1)}%)`
        : "";
      return `[Source ${i + 1}: ${result.documentTitle}, chunk ${result.chunkIndex}${similarityStr}]\n${result.content}`;
    })
    .join("\n\n---\n\n");
}
