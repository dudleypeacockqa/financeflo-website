/**
 * Content generation grounded in the Knowledge Base.
 * Supports blog posts, LinkedIn posts, email sequences, and case study outlines.
 */
import { invokeLLM } from "../llm";
import { searchKnowledge } from "../knowledge/search";

export interface ContentParams {
  contentType: "blog_post" | "linkedin_post" | "email_sequence" | "case_study_outline";
  topic: string;
  tone: "professional" | "conversational" | "educational";
  length: "short" | "medium" | "long";
}

export interface GeneratedContent {
  title: string;
  content: string;
  contentType: string;
  wordCount: number;
  sources: { documentTitle: string; chunkIndex: number }[];
}

const LENGTH_GUIDES: Record<string, string> = {
  short: "Keep it concise: ~300 words for blog, ~150 words for LinkedIn, 2 emails in sequence, 1-page outline.",
  medium: "Standard length: ~800 words for blog, ~300 words for LinkedIn, 3 emails in sequence, 2-page outline.",
  long: "Comprehensive: ~1500 words for blog, ~500 words for LinkedIn, 5 emails in sequence, detailed outline.",
};

const TONE_GUIDES: Record<string, string> = {
  professional: "Formal but accessible. Use industry terminology confidently. Cite specific data and frameworks.",
  conversational: "Friendly and approachable. Use 'you' and 'we'. Short sentences. Practical examples.",
  educational: "Teaching tone. Explain concepts clearly. Use analogies. Structure with clear headings and takeaways.",
};

const TYPE_GUIDES: Record<string, string> = {
  blog_post: "Write a blog post with a compelling headline, introduction hook, structured sections with subheadings, and a clear call-to-action. Include practical takeaways.",
  linkedin_post: "Write a LinkedIn post that hooks in the first line, tells a story or shares an insight, uses line breaks for readability, and ends with a question or CTA. Use relevant hashtags.",
  email_sequence: "Write an email sequence (drip campaign). Each email should have: Subject line, preview text, body, and CTA. Space them logically. First email = value, middle = insight, final = soft CTA.",
  case_study_outline: "Create a structured case study outline with: Client situation, challenge, solution approach (using ADAPT/AIBA), implementation highlights, quantified results, and testimonial prompt.",
};

export async function generateContent(params: ContentParams): Promise<GeneratedContent> {
  const { contentType, topic, tone, length } = params;

  // Search KB for topic-relevant content
  const kbResults = await searchKnowledge(topic, 5);

  let kbContext = "";
  if (kbResults.length > 0) {
    kbContext = kbResults
      .map((r) => `[${r.documentTitle}]\n${r.content}`)
      .join("\n\n---\n\n");
  }

  const prompt = `Generate ${contentType.replace(/_/g, " ")} about the following topic.

TOPIC: ${topic}

TONE: ${TONE_GUIDES[tone]}
LENGTH: ${LENGTH_GUIDES[length]}
FORMAT: ${TYPE_GUIDES[contentType]}

${kbContext ? `KNOWLEDGE BASE CONTEXT (use this to ground your content in FinanceFlo's actual frameworks and methodology):\n${kbContext}` : ""}

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "string - compelling title/headline",
  "content": "string - the full generated content with markdown formatting"
}`;

  try {
    const raw = await invokeLLM({
      systemPrompt: `You are FinanceFlo's content strategist. Generate high-quality content grounded in the company's frameworks (AIBA, ADAPT, CKPS, Connected Intelligence). Content should be original, insightful, and actionable. Always reference specific FinanceFlo methodology when relevant. Return valid JSON only.`,
      userPrompt: prompt,
      maxTokens: 4096,
    });

    const parsed = JSON.parse(raw) as { title: string; content: string };
    const wordCount = parsed.content.split(/\s+/).length;

    return {
      ...parsed,
      contentType,
      wordCount,
      sources: kbResults.map((r) => ({
        documentTitle: r.documentTitle,
        chunkIndex: r.chunkIndex,
      })),
    };
  } catch (error: any) {
    console.error("[ContentGenerator] Failed:", error.message);
    throw new Error("Content generation failed. Please try again.");
  }
}
