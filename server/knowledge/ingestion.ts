/**
 * Document ingestion: parsing and recursive text chunking.
 * Supports SRT, TXT, and raw text content.
 * PDF/PPTX parsing added when pdf-parse/mammoth are installed.
 */

const TARGET_CHUNK_TOKENS = 500;
const OVERLAP_TOKENS = 50;
// Rough approximation: 1 token ≈ 4 characters
const CHARS_PER_TOKEN = 4;

/**
 * Parse SRT subtitle content into plain text.
 */
export function parseSrt(content: string): string {
  return content
    .split(/\r?\n\r?\n/)
    .map(block => {
      const lines = block.trim().split(/\r?\n/);
      // Skip index and timestamp lines
      return lines.slice(2).join(" ");
    })
    .filter(text => text.trim().length > 0)
    .join(" ");
}

/**
 * Parse raw text content based on MIME type.
 */
export async function parseContent(content: string, mimeType?: string): Promise<string> {
  if (!mimeType || mimeType === "text/plain") {
    return content;
  }

  if (mimeType === "application/x-subrip" || mimeType === "text/srt") {
    return parseSrt(content);
  }

  // For other text types, return as-is
  return content;
}

/**
 * Estimate token count from text.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Recursively chunk text into segments of approximately TARGET_CHUNK_TOKENS tokens.
 * Uses paragraph boundaries when possible, falls back to sentence boundaries,
 * then word boundaries.
 */
export function chunkText(text: string): { content: string; tokenCount: number }[] {
  const targetChars = TARGET_CHUNK_TOKENS * CHARS_PER_TOKEN;
  const overlapChars = OVERLAP_TOKENS * CHARS_PER_TOKEN;

  if (text.length <= targetChars * 1.2) {
    return [{
      content: text.trim(),
      tokenCount: estimateTokens(text.trim()),
    }];
  }

  const chunks: { content: string; tokenCount: number }[] = [];

  // Try splitting by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 > targetChars && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: estimateTokens(currentChunk.trim()),
      });

      // Start new chunk with overlap from end of previous
      const overlap = currentChunk.slice(-overlapChars);
      currentChunk = overlap + " " + trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    // If remaining chunk is too large, split by sentences
    if (currentChunk.length > targetChars * 1.5) {
      chunks.push(...chunkBySentences(currentChunk, targetChars, overlapChars));
    } else {
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: estimateTokens(currentChunk.trim()),
      });
    }
  }

  return chunks.filter(c => c.content.length > 0);
}

function chunkBySentences(text: string, targetChars: number, overlapChars: number): { content: string; tokenCount: number }[] {
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const chunks: { content: string; tokenCount: number }[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > targetChars && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: estimateTokens(currentChunk.trim()),
      });
      const overlap = currentChunk.slice(-overlapChars);
      currentChunk = overlap + sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      tokenCount: estimateTokens(currentChunk.trim()),
    });
  }

  return chunks;
}
