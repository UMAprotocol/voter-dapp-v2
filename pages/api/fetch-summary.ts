import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import * as ss from "superstruct";
import { OutcomeData, SummaryResponse } from "types/summary";
import { isDiscordSummaryDisabled } from "helpers/disabledSummaries";

// Types imported from types/summary.ts

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
  summaryBatchSize: number;
  totalComments?: number;
  uniqueUsers?: number;
  outputSources?: number;
  missingCommentDetails?: Array<{
    sender: string;
    time: number;
    message: string;
  }>; // Not returned to client
  droppedRepliesCount?: number;
}

// Helper function to extract unique missing users from comment details
function extractMissingUsers(
  missingCommentDetails: Array<{
    sender: string;
    time: number;
    message: string;
  }>
): string[] {
  const uniqueUsers = new Set<string>();
  missingCommentDetails.forEach((comment) => {
    uniqueUsers.add(comment.sender);
  });
  return Array.from(uniqueUsers);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    SummaryResponse | { error: string; details?: string } | { message: string }
  >
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Define query parameter schema
  const QueryParamsSchema = ss.object({
    time: ss.string(),
    identifier: ss.string(),
    title: ss.string(),
  });

  // Validate query parameters
  try {
    ss.assert(req.query, QueryParamsSchema);
  } catch (error) {
    return res.status(400).json({
      error:
        "Invalid query parameters: time, identifier, and title are required and must be strings",
      details:
        error instanceof Error ? error.message : "Unknown validation error",
    });
  }

  const { time, identifier, title } = req.query as {
    time: string;
    identifier: string;
    title: string;
  };

  try {
    // Initialize Redis
    const redis = Redis.fromEnv();

    // Create cache key using the primary parameters only (must match update-summary)
    const cacheKey = `discord-summary:${time}:${identifier}:${title}`;

    // Check if this summary is disabled
    if (isDiscordSummaryDisabled(cacheKey)) {
      return res.status(403).json({
        message: "Discord summary is disabled for this market.",
      });
    }

    // Get cached data
    const cachedData = await redis.get<CacheData>(cacheKey);

    if (!cachedData) {
      return res.status(404).json({
        message:
          "No cached summary found for this identifier. Use /api/update-summary to generate one.",
      });
    }

    // Return cached data with correct structure
    // Note: missingCommentDetails is intentionally excluded from the response to avoid bloating
    // Extract missingUsers from missingCommentDetails if present
    const missingUsers = cachedData.missingCommentDetails
      ? extractMissingUsers(cachedData.missingCommentDetails)
      : undefined;

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
      summaryBatchSize: cachedData.summaryBatchSize,
      ...(cachedData.totalComments !== undefined && {
        totalComments: cachedData.totalComments,
      }),
      ...(cachedData.uniqueUsers !== undefined && {
        uniqueUsers: cachedData.uniqueUsers,
      }),
      ...(cachedData.outputSources !== undefined && {
        outputSources: cachedData.outputSources,
      }),
      ...(missingUsers && missingUsers.length > 0 && { missingUsers }),
      ...(cachedData.droppedRepliesCount !== undefined && {
        droppedRepliesCount: cachedData.droppedRepliesCount,
      }),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetch-summary API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ error: `Failed to fetch summary: ${errorMessage}` });
  }
}
