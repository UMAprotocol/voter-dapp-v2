import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

interface OutcomeData {
  description: string;
  summary: string;
  sources: [string, number][];
}

interface UncategorizedData {
  summary: string;
  sources: [string, number][];
}

interface StructuredSummary {
  P1: OutcomeData;
  P2: OutcomeData;
  P3: OutcomeData;
  P4: OutcomeData;
  Uncategorized: UncategorizedData;
}

interface SummaryResponse {
  summary: StructuredSummary;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
}

interface CachedSummary extends SummaryResponse {
  cachedAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    SummaryResponse | { error: string } | { message: string }
  >
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { identifier } = req.query;

  // Validate required parameters
  if (!identifier || Array.isArray(identifier)) {
    return res.status(400).json({
      error: "Missing required parameter: identifier is required",
    });
  }

  try {
    // Initialize Redis
    const redis = Redis.fromEnv();
    const cacheKey = `discord-summary:${identifier}`;

    // Get cached data
    const cachedData = await redis.get<CachedSummary>(cacheKey);

    if (!cachedData) {
      return res.status(404).json({
        message:
          "No cached summary found for this identifier. Use /api/update-summary to generate one.",
      });
    }

    // Return cached data
    const response: SummaryResponse = {
      summary: cachedData.summary,
      generatedAt: cachedData.generatedAt,
      commentsHash: cachedData.commentsHash,
      promptVersion: cachedData.promptVersion,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetch-summary API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ error: `Failed to fetch summary: ${errorMessage}` });
  }
}
