/**
 * Relevance AI wrapper for LinkedIn profile scraping.
 * Cost: ~$0.05 per lead.
 */
import axios from "axios";
import { ENV } from "../env";

const RELEVANCE_API_URL = "https://api-d7b62b.stack.tryrelevance.com/latest/studios";

export interface LinkedInProfileData {
  name: string;
  headline: string;
  location: string;
  about: string;
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { school: string; degree: string; field: string }[];
  skills: string[];
  recentPosts: { content: string; date: string; engagement: number }[];
  connectionCount: number;
  profileUrl: string;
}

/**
 * Scrape a LinkedIn profile using Relevance AI.
 * Returns structured profile data including experience, posts, and skills.
 */
export async function scrapeLinkedInProfile(linkedinUrl: string): Promise<LinkedInProfileData> {
  if (!ENV.relevanceAiApiKey) {
    throw new Error("RELEVANCE_AI_API_KEY not configured");
  }

  try {
    const response = await axios.post(
      `${RELEVANCE_API_URL}/linkedin-scraper/trigger_limited`,
      {
        params: { linkedin_url: linkedinUrl },
        project: ENV.relevanceAiProjectId || undefined,
      },
      {
        headers: {
          "Authorization": ENV.relevanceAiApiKey,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const data = response.data;

    // Normalize response into our expected format
    return {
      name: data.output?.name || data.name || "",
      headline: data.output?.headline || data.headline || "",
      location: data.output?.location || data.location || "",
      about: data.output?.about || data.about || "",
      experience: data.output?.experience || data.experience || [],
      education: data.output?.education || data.education || [],
      skills: data.output?.skills || data.skills || [],
      recentPosts: data.output?.recent_posts || data.recent_posts || [],
      connectionCount: data.output?.connection_count || data.connection_count || 0,
      profileUrl: linkedinUrl,
    };
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error("Relevance AI rate limit exceeded. Try again later.");
    }
    throw new Error(`LinkedIn scrape failed: ${error.message}`);
  }
}
