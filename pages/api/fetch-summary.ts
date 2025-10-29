import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import * as ss from "superstruct";
import { OutcomeData, SummaryResponse } from "types/summary";
import { isDiscordSummaryDisabled } from "helpers/disabledSummaries";
import { validateQueryParams } from "./_utils/validation";
import { handleApiError, HttpError } from "./_utils/errors";

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

// Request validation schema
const QueryParamsSchema = ss.object({
  time: ss.string(),
  identifier: ss.string(),
  title: ss.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    SummaryResponse | { error: string; details?: string } | { message: string }
  >
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request query parameters
    const { time, identifier, title } = validateQueryParams(
      req.query,
      QueryParamsSchema
    );

    // Initialize Redis
    const redis = Redis.fromEnv();

    // Create cache key using the primary parameters only (must match update-summary)
    const cacheKey = `discord-summary:${time}:${identifier}:${title}`;

    // Check if this summary is disabled
    if (isDiscordSummaryDisabled(cacheKey)) {
      throw new HttpError({
        statusCode: 403,
        msg: "Discord summary is disabled for this market.",
      });
    }

    // Get cached data
    const cachedData = await redis.get<CacheData>(cacheKey);

    if (!cachedData) {
      throw new HttpError({
        statusCode: 404,
        msg: "No cached summary found for this identifier. Use /api/update-summary to generate one.",
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
    return handleApiError(error, res);
  }
}
