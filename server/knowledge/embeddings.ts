/**
 * Embedding generation via Voyage AI.
 * Falls back gracefully if VOYAGE_API_KEY is not configured.
 */
import axios from "axios";
import { ENV } from "../env";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embeddings for an array of text strings using Voyage AI.
 * Returns an array of number[] vectors, one per input text.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!ENV.voyageApiKey) {
    console.warn("[Embeddings] VOYAGE_API_KEY not configured. Skipping embedding generation.");
    return texts.map(() => []);
  }

  if (texts.length === 0) return [];

  // Voyage AI supports batch requests up to 128 texts
  const batchSize = 128;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    try {
      const response = await axios.post(
        VOYAGE_API_URL,
        {
          input: batch,
          model: VOYAGE_MODEL,
        },
        {
          headers: {
            "Authorization": `Bearer ${ENV.voyageApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const embeddings = response.data.data.map(
        (item: { embedding: number[] }) => item.embedding
      );
      allEmbeddings.push(...embeddings);
    } catch (error: any) {
      console.error(`[Embeddings] Voyage AI error for batch ${i / batchSize}:`, error.message);
      // Push empty embeddings for failed batch
      allEmbeddings.push(...batch.map(() => []));
    }
  }

  return allEmbeddings;
}

/**
 * Generate a single embedding for a query string.
 */
export async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  const results = await generateEmbeddings([query]);
  const embedding = results[0];
  return embedding && embedding.length > 0 ? embedding : null;
}
