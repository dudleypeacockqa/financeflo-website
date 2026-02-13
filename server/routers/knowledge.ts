import { adminProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import { documents, knowledgeChunks } from "../../drizzle/schema";
import { eq, desc, sql, ilike, or } from "drizzle-orm";
import { enqueueJob } from "../jobs/queue";

export const knowledgeRouter = router({
  /** Upload a new document for processing */
  upload: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      type: z.enum(["transcript", "meeting_notes", "framework", "course_material", "prompt", "other"]),
      rawContent: z.string().optional(),
      filename: z.string().optional(),
      mimeType: z.string().optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(documents).values({
        title: input.title,
        type: input.type,
        status: input.rawContent ? "processing" : "pending",
        rawContent: input.rawContent,
        filename: input.filename,
        mimeType: input.mimeType,
        tags: input.tags,
        metadata: input.metadata,
      }).returning();

      const doc = rows[0];

      // If raw content provided, enqueue chunking + embedding job
      if (input.rawContent) {
        await enqueueJob("embed_document", { documentId: doc.id });
      }

      return doc;
    }),

  /** List all documents */
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      type: z.enum(["transcript", "meeting_notes", "framework", "course_material", "prompt", "other"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      if (input?.type) {
        return db.select().from(documents)
          .where(eq(documents.type, input.type))
          .orderBy(desc(documents.createdAt))
          .limit(input?.limit ?? 50);
      }

      return db.select().from(documents)
        .orderBy(desc(documents.createdAt))
        .limit(input?.limit ?? 50);
    }),

  /** Get document by ID with its chunks */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const docRows = await db.select().from(documents).where(eq(documents.id, input.id)).limit(1);
      if (docRows.length === 0) return null;

      const chunks = await db.select({
        id: knowledgeChunks.id,
        chunkIndex: knowledgeChunks.chunkIndex,
        content: knowledgeChunks.content,
        tokenCount: knowledgeChunks.tokenCount,
      }).from(knowledgeChunks)
        .where(eq(knowledgeChunks.documentId, input.id))
        .orderBy(knowledgeChunks.chunkIndex);

      return { ...docRows[0], chunks };
    }),

  /** Delete a document and its chunks */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, input.id));
      await db.delete(documents).where(eq(documents.id, input.id));

      return { success: true };
    }),

  /** Full-text search across knowledge chunks */
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // Full-text fallback search using ILIKE
      const searchPattern = `%${input.query}%`;
      const results = await db.select({
        chunkId: knowledgeChunks.id,
        content: knowledgeChunks.content,
        documentId: knowledgeChunks.documentId,
        chunkIndex: knowledgeChunks.chunkIndex,
        tokenCount: knowledgeChunks.tokenCount,
        documentTitle: documents.title,
        documentType: documents.type,
      })
        .from(knowledgeChunks)
        .innerJoin(documents, eq(knowledgeChunks.documentId, documents.id))
        .where(ilike(knowledgeChunks.content, searchPattern))
        .limit(input.limit ?? 10);

      return results;
    }),

  /** Semantic search using vector similarity (requires embeddings) */
  semanticSearch: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      // Import dynamically to avoid circular deps
      const { searchKnowledge } = await import("../knowledge/search");
      return searchKnowledge(input.query, input.limit ?? 5);
    }),

  /** Test RAG query against the knowledge base */
  testRag: adminProcedure
    .input(z.object({
      query: z.string().min(1),
      maxChunks: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { queryWithRag } = await import("../knowledge/rag");
      return queryWithRag(input.query, input.maxChunks ?? 5);
    }),
});
