import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

// Interface matching the CacheData structure from update-summary
interface CacheData {
  P1: { summary: string; sources: [string, number][] };
  P2: { summary: string; sources: [string, number][] };
  P3: { summary: string; sources: [string, number][] };
  P4: { summary: string; sources: [string, number][] };
  Uncategorized: { summary: string; sources: [string, number][] };
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  cachedAt: string;
  summaryBatchSize: number;
  model?: string;
  totalComments?: number;
  uniqueUsers?: number;
  outputSources?: number;
  missingCommentDetails?: Array<{
    sender: string;
    time: number;
    message: string;
  }>;
  droppedRepliesCount?: number;
}

// Interface for the summary with its key information
interface SummaryWithKey {
  key: string;
  time: string;
  identifier: string;
  title: string;
  ignoredUsernamesHash?: string;
  data: CacheData;
}

export interface AllSummariesResponse {
  summaries: SummaryWithKey[];
  totalCount: number;
  fetchedAt: string;
}

function parseRedisKey(key: string): {
  time: string;
  identifier: string;
  title: string;
  ignoredUsernamesHash?: string;
} | null {
  // Key format: discord-summary:{time}:{identifier}:{title}[:ignored-{hash}]
  if (!key.startsWith("discord-summary:")) {
    return null;
  }

  const withoutPrefix = key.substring("discord-summary:".length);
  const parts = withoutPrefix.split(":");

  if (parts.length < 3) {
    return null;
  }

  // Check if last part is an ignored usernames hash
  let ignoredUsernamesHash: string | undefined;
  let titleParts = parts.slice(2);

  const lastPart = titleParts[titleParts.length - 1];
  if (lastPart && lastPart.startsWith("ignored-")) {
    ignoredUsernamesHash = lastPart;
    titleParts = titleParts.slice(0, -1);
  }

  return {
    time: parts[0],
    identifier: parts[1],
    title: titleParts.join(":"), // Rejoin in case title contains colons
    ignoredUsernamesHash,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllSummariesResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const startTime = Date.now();

    // Initialize Redis
    const redis = Redis.fromEnv();

    // Get all keys matching discord-summary:* pattern in one shot
    // Using keys command which is faster for serverless functions
    const keys = await redis.keys("discord-summary:*");

    console.log(
      `[All Summaries] Found ${keys.length} keys in ${Date.now() - startTime}ms`
    );

    if (keys.length === 0) {
      return res.status(200).json({
        summaries: [],
        totalCount: 0,
        fetchedAt: new Date().toISOString(),
      });
    }

    // Use mget to fetch all values in parallel
    const fetchStart = Date.now();
    const summaries: SummaryWithKey[] = [];

    // Process keys in larger batches for better performance
    const batchSize = 50;
    const batches: Promise<void>[] = [];

    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);

      const batchPromise = Promise.all(
        batchKeys.map(async (key) => {
          try {
            const data = await redis.get<CacheData>(key);

            if (data) {
              const keyInfo = parseRedisKey(key);
              if (keyInfo) {
                summaries.push({
                  key,
                  time: keyInfo.time,
                  identifier: keyInfo.identifier,
                  title: keyInfo.title,
                  ignoredUsernamesHash: keyInfo.ignoredUsernamesHash,
                  data,
                });
              }
            }
          } catch (error) {
            console.error(`[All Summaries] Error fetching key ${key}:`, error);
          }
        })
      );

      batches.push(batchPromise);
    }

    // Wait for all batches to complete
    await Promise.all(batches);

    console.log(
      `[All Summaries] Fetched ${summaries.length} values in ${
        Date.now() - fetchStart
      }ms`
    );

    // Sort summaries by time (newest first)
    summaries.sort((a, b) => {
      const timeA = parseInt(a.time);
      const timeB = parseInt(b.time);
      return timeB - timeA;
    });

    const response: AllSummariesResponse = {
      summaries,
      totalCount: summaries.length,
      fetchedAt: new Date().toISOString(),
    };

    console.log(
      `[All Summaries] Total processing time: ${Date.now() - startTime}ms`
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in fetch-all-cached-summaries API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ error: `Failed to fetch summaries: ${errorMessage}` });
  }
}
