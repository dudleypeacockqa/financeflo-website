/**
 * Knowledge base search: pgvector similarity search with full-text fallback.
 */
import { getDb } from "../db";
import { knowledgeChunks, documents } from "../../drizzle/schema";
import { eq, ilike, sql } from "drizzle-orm";
import { generateQueryEmbedding } from "./embeddings";

export interface SearchResult {
  chunkId: number;
  content: string;
  documentId: number;
  documentTitle: string;
  documentType: string;
  chunkIndex: number;
  tokenCount: number;
  similarity?: number;
}

/**
 * Search knowledge base using vector similarity when embeddings are available,
 * falling back to full-text ILIKE search.
 */
export async function searchKnowledge(query: string, limit: number = 5): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db) return [];

  // Try vector search first
  const queryEmbedding = await generateQueryEmbedding(query);

  if (queryEmbedding && queryEmbedding.length > 0) {
    return vectorSearch(db, queryEmbedding, limit);
  }

  // Fall back to full-text search
  return fullTextSearch(db, query, limit);
}

async function vectorSearch(db: any, embedding: number[], limit: number): Promise<SearchResult[]> {
  const embeddingStr = `[${embedding.join(",")}]`;

  try {
    const results = await db.execute(
      sql`SELECT
        kc.id as "chunkId",
        kc.content,
        kc."documentId",
        d.title as "documentTitle",
        d.type as "documentType",
        kc."chunkIndex",
        kc."tokenCount",
        1 - (kc.embedding <=> ${embeddingStr}::vector) as similarity
      FROM "knowledgeChunks" kc
      INNER JOIN documents d ON kc."documentId" = d.id
      WHERE kc.embedding IS NOT NULL
      ORDER BY kc.embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}`
    );

    return (results.rows || results) as SearchResult[];
  } catch (error: any) {
    console.error("[Search] Vector search failed, falling back to full-text:", error.message);
    return [];
  }
}

async function fullTextSearch(db: any, query: string, limit: number): Promise<SearchResult[]> {
  const searchPattern = `%${query}%`;

  const results = await db.select({
    chunkId: knowledgeChunks.id,
    content: knowledgeChunks.content,
    documentId: knowledgeChunks.documentId,
    documentTitle: documents.title,
    documentType: documents.type,
    chunkIndex: knowledgeChunks.chunkIndex,
    tokenCount: knowledgeChunks.tokenCount,
  })
    .from(knowledgeChunks)
    .innerJoin(documents, eq(knowledgeChunks.documentId, documents.id))
    .where(ilike(knowledgeChunks.content, searchPattern))
    .limit(limit);

  return results;
}
