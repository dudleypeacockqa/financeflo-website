/**
 * Perplexity AI wrapper for company research.
 * Uses the Sonar model for web-grounded research.
 * Cost: ~$0.10 per lead.
 */
import axios from "axios";
import { ENV } from "../env";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const MODEL = "sonar";

export interface CompanyResearch {
  companyName: string;
  website: string;
  description: string;
  industry: string;
  employeeCount: string;
  revenue: string;
  recentNews: string[];
  challenges: string[];
  techStack: string[];
  keyPeople: { name: string; title: string }[];
  rawResponse: string;
}

/**
 * Research a company using Perplexity AI's web-grounded search.
 */
export async function researchCompany(
  companyName: string,
  industry?: string,
  website?: string
): Promise<CompanyResearch> {
  if (!ENV.perplexityApiKey) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }

  const prompt = `Research the company "${companyName}"${industry ? ` in the ${industry} industry` : ""}${website ? ` (website: ${website})` : ""}.

Provide comprehensive information about:
1. What the company does and their main services/products
2. Company size (employee count, revenue if available)
3. Recent news or developments (last 12 months)
4. Key challenges they likely face in their industry
5. Technology stack or systems they use (if known)
6. Key leadership team members and their roles

Format your response as structured information I can parse.`;

  try {
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a B2B company research analyst. Provide factual, detailed company intelligence. Focus on information relevant to selling AI and technology consulting services.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2048,
      },
      {
        headers: {
          "Authorization": `Bearer ${ENV.perplexityApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const rawResponse = response.data.choices?.[0]?.message?.content || "";

    return {
      companyName,
      website: website || "",
      description: rawResponse,
      industry: industry || "",
      employeeCount: "",
      revenue: "",
      recentNews: [],
      challenges: [],
      techStack: [],
      keyPeople: [],
      rawResponse,
    };
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error("Perplexity API rate limit exceeded. Try again later.");
    }
    throw new Error(`Company research failed: ${error.message}`);
  }
}
