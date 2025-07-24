import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

export interface OutcomeData {
  summary: string;
  sources: [string, number][];
}

export interface StructuredSummary {
  P1: OutcomeData;
  P2: OutcomeData;
  P3: OutcomeData;
  P4: OutcomeData;
  Uncategorized?: OutcomeData;
}

export interface SummaryResponse {
  summary: StructuredSummary;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
}

// Use the same simplified cache structure as update-summary
interface CacheData {
  P1: OutcomeData;
  P2: OutcomeData;
  P3: OutcomeData;
  P4: OutcomeData;
  Uncategorized: OutcomeData;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
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

  const { time, identifier, title } = req.query;

  // Validate required parameters
  if (
    !time ||
    !identifier ||
    !title ||
    Array.isArray(time) ||
    Array.isArray(identifier) ||
    Array.isArray(title)
  ) {
    return res.status(400).json({
      error:
        "Missing required parameters: time, identifier, and title are required",
    });
  }

  try {
    // Initialize Redis
    const redis = Redis.fromEnv();
    // Create unique cache key using all three parameters (same format as update-summary)
    const cacheKey = `discord-summary:${time}:${identifier}:${title}`;

    // Get cached data
    const cachedData = await redis.get<CacheData>(cacheKey);

    if (!cachedData) {
      return res.status(404).json({
        message:
          "No cached summary found for this identifier. Use /api/update-summary to generate one.",
      });
    }

    // Return cached data with correct structure
    const response: SummaryResponse = {
      summary: {
        P1: cachedData.P1,
        P2: cachedData.P2,
        P3: cachedData.P3,
        P4: cachedData.P4,
        Uncategorized: cachedData.Uncategorized,
      },
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
