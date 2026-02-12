import { Redis } from "@upstash/redis";
import * as ss from "superstruct";
import {
  RawDiscordMessageT,
  RawDiscordThreadT,
  RawDiscordThreadSchema,
  ThreadIdMap,
  VoteDiscussionT,
} from "types";
import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { sleep } from "lib/utils";
import { extractValidateTitleAndTimestamp } from "lib/discord-utils";
import { createCacheKey } from "lib/cache-keys";
import { validateRedisData } from "../_utils/validation";

// Cache configuration
export const THREAD_CACHE_KEY = createCacheKey("discord:thread_cache");
export const THREAD_MESSAGES_CACHE_KEY = createCacheKey(
  "discord:thread_messages"
);
export const PROCESSED_THREAD_CACHE_KEY = createCacheKey(
  "discord:processed_thread"
);
const MAX_DISCORD_MESSAGE = 100; // 0-100

const ThreadIdMapCacheSchema = ss.type({
  threadIdMap: ss.record(ss.string(), ss.string()),
  latestThreadId: ss.nullable(ss.string()),
  lastFullRebuildAt: ss.optional(ss.number()),
});

type ThreadIdMapCache = ss.Infer<typeof ThreadIdMapCacheSchema>;

// How often to do a full rebuild (catches threads missed due to race conditions)
export const FULL_REBUILD_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours

// How far back to look during a full rebuild (no need to fetch ancient history)
export const FULL_REBUILD_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

// Discord epoch (January 1, 2015) used for snowflake ID conversion
const DISCORD_EPOCH = BigInt(1420070400000);

/**
 * Extracts the timestamp from a Discord snowflake ID.
 * Snowflakes encode the creation timestamp in the high bits.
 */
export function getTimestampFromSnowflake(snowflake: string): number {
  return Number((BigInt(snowflake) >> BigInt(22)) + DISCORD_EPOCH);
}

export function shouldDoFullRebuild(
  cachedData: ThreadIdMapCache | null
): boolean {
  if (!cachedData) return true;
  if (!cachedData.lastFullRebuildAt) return true;

  const timeSinceLastRebuild = Date.now() - cachedData.lastFullRebuildAt;
  return timeSinceLastRebuild >= FULL_REBUILD_INTERVAL_MS;
}

// Set to true to disable Redis caching (useful for local development)
const DISABLE_REDIS = process.env.DISABLE_REDIS === "true";

// singleton
let redis: Redis | undefined;
export function getRedis(): Redis | null {
  if (DISABLE_REDIS) {
    return null;
  }
  redis ??= Redis.fromEnv();
  return redis;
}

// Cache functions for thread cache object
export async function getCachedThreadIdMap(): Promise<ThreadIdMapCache | null> {
  if (DISABLE_REDIS) {
    return null;
  }
  const redis = getRedis();
  if (!redis) return null;
  const rawData = await redis.get<unknown>(THREAD_CACHE_KEY);
  if (rawData === null) return null;
  validateRedisData(rawData, ThreadIdMapCacheSchema);
  return rawData;
}

export async function setCachedThreadIdMap(
  threadIdMap: ThreadIdMap,
  latestThreadId: string | null,
  lastFullRebuildAt?: number
) {
  if (DISABLE_REDIS) {
    return;
  }
  const redis = getRedis();
  if (!redis) return;
  const result = await redis.set(THREAD_CACHE_KEY, {
    threadIdMap,
    latestThreadId,
    lastFullRebuildAt,
  });
  if (!result) {
    throw new Error("Setting threadIdMap cache failed");
  }
  return result;
}

// Cache functions for thread messages
export async function getCachedThreadMessages(
  threadId: string
): Promise<RawDiscordThreadT | null> {
  if (DISABLE_REDIS) {
    return null;
  }
  const redis = getRedis();
  if (!redis) return null;
  const cacheKey = `${THREAD_MESSAGES_CACHE_KEY}:${threadId}`;
  const rawData = await redis.get<unknown>(cacheKey);
  if (rawData === null) return null;
  // Validates essential fields; returns as RawDiscordThreadT (full Discord API type)
  validateRedisData(rawData, RawDiscordThreadSchema);
  return rawData as RawDiscordThreadT;
}

export async function setCachedThreadMessages(
  threadId: string,
  messages: RawDiscordThreadT
) {
  if (DISABLE_REDIS) {
    return;
  }
  const redis = getRedis();
  if (!redis) return;
  const cacheKey = `${THREAD_MESSAGES_CACHE_KEY}:${threadId}`;
  // Cache for 1 hour (3600 seconds)
  const result = await redis.setex(cacheKey, 3600, messages);
  if (!result) {
    throw new Error("Setting thread messages cache failed");
  }
  return result;
}

// Cache functions for processed thread data (used by cron job and endpoint)
export async function getCachedProcessedThread(
  requestKey: string
): Promise<VoteDiscussionT | null> {
  if (DISABLE_REDIS) {
    return null;
  }
  const redis = getRedis();
  if (!redis) return null;
  const cacheKey = `${PROCESSED_THREAD_CACHE_KEY}:${requestKey}`;
  const rawData = await redis.get<unknown>(cacheKey);
  if (rawData === null) return null;
  validateRedisData(rawData, VoteDiscussionT);
  return rawData;
}

export async function setCachedProcessedThread(
  requestKey: string,
  data: VoteDiscussionT
) {
  if (DISABLE_REDIS) {
    return;
  }
  const redis = getRedis();
  if (!redis) return;
  const cacheKey = `${PROCESSED_THREAD_CACHE_KEY}:${requestKey}`;
  // Cache for 1 hour (3600 seconds) - will be refreshed by cron every 10 min
  const result = await redis.setex(cacheKey, 3600, data);
  if (!result) {
    throw new Error("Setting processed thread cache failed");
  }
  return result;
}

// ============================================================================
// Discord API - Retry Configuration
// ============================================================================

const MAX_RETRIES = 5;
const BASE_DELAY = 1_000; // 1 second
const MAX_DELAY = 30_000; // 30 seconds

function calculateBackoffDelay(attempt: number): number {
  const exponentialDelay = BASE_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(MAX_DELAY, exponentialDelay + jitter);
}

export function getRetryMilliseconds(
  response: Response,
  attempt: number
): number {
  const resetHeader = response.headers.get("X-RateLimit-Reset-After");
  if (!resetHeader) {
    return calculateBackoffDelay(attempt);
  }

  const seconds = parseFloat(resetHeader);
  if (!isNaN(seconds) && seconds > 0) {
    return Math.ceil(seconds * 1000);
  }

  return calculateBackoffDelay(attempt);
}

// ============================================================================
// Discord API - Low-level Fetch
// ============================================================================

async function fetchDiscordEndpoint(endpoint: string): Promise<Response> {
  const url = "https://discord.com/api/v10/" + endpoint;
  return fetch(url, {
    headers: {
      Authorization: `Bot ${discordToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent": "DiscordBot (https://vote.uma.xyz, 1.0.0)",
    },
  });
}

async function handleRateLimitedResponse(
  res: Response,
  endpoint: string,
  attempt: number
): Promise<void> {
  const delay = getRetryMilliseconds(res, attempt);
  const isGlobal = res.headers.get("x-ratelimit-global") === "true";

  if (attempt >= MAX_RETRIES) {
    throw new Error(
      `Discord API rate limited (429) at ${endpoint} after ${MAX_RETRIES} retries${
        isGlobal ? " (GLOBAL)" : ""
      }`
    );
  }

  console.warn(
    `Discord API rate limited (429) at ${endpoint}${
      isGlobal ? " (GLOBAL)" : ""
    }, retrying after ${delay}ms (attempt ${attempt}/${MAX_RETRIES + 1})`
  );

  await sleep(delay);
}

async function handleErrorResponse(
  res: Response,
  endpoint: string
): Promise<never> {
  const errorText = await res.text();
  throw new Error(
    `Discord API error ${res.status} at ${endpoint}: ${errorText}`
  );
}

// ============================================================================
// Discord API - Request with Retries
// ============================================================================

export async function discordRequest(
  endpoint: string
): Promise<RawDiscordThreadT> {
  let attempt = 1;
  let finalError: unknown;

  while (attempt <= MAX_RETRIES) {
    try {
      const res = await fetchDiscordEndpoint(endpoint);

      if (res.status === 429) {
        await handleRateLimitedResponse(res, endpoint, attempt);
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        await handleErrorResponse(res, endpoint);
      }

      return (await res.json()) as RawDiscordThreadT;
    } catch (error) {
      finalError = error;

      if (attempt >= MAX_RETRIES) {
        break;
      }

      const delay = calculateBackoffDelay(attempt);
      console.warn("Discord API retrying for non-429 error", error);
      await sleep(delay);
      attempt += 1;
    }
  }

  console.error(
    `Failed to fetch from Discord API after ${MAX_RETRIES} retries at ${endpoint}:`,
    finalError
  );
  throw finalError;
}

// ============================================================================
// Discord API - Message Fetching (Pagination Helpers)
// ============================================================================

type MessageFetchResult = {
  messages: RawDiscordThreadT;
  latestMessageId: string | undefined;
  lastMessageId: string | undefined;
  isStale?: boolean;
};

/**
 * Fetches messages from a channel/thread going backward in time.
 * Stops when reaching messages older than the cutoff timestamp (if provided).
 */
async function fetchAllMessagesBackward(
  channelOrThreadId: string,
  oldestTimestamp?: number
): Promise<RawDiscordThreadT> {
  let allMessages: RawDiscordThreadT = [];
  let beforeMessageId: string | undefined = undefined;
  let batchCount = 0;

  do {
    let url = `channels/${channelOrThreadId}/messages?limit=${MAX_DISCORD_MESSAGE}`;
    if (beforeMessageId) {
      url += `&before=${beforeMessageId}`;
    }

    const messages = await discordRequest(url);
    batchCount++;

    // Filter out messages older than the cutoff and check if we should stop
    let reachedCutoff = false;
    const filteredMessages = oldestTimestamp
      ? messages.filter((msg) => {
          const msgTimestamp = getTimestampFromSnowflake(msg.id);
          if (msgTimestamp < oldestTimestamp) {
            reachedCutoff = true;
            return false;
          }
          return true;
        })
      : messages;

    allMessages = allMessages.concat(filteredMessages);

    if (reachedCutoff) {
      console.log(
        `[discord] reached lookback cutoff after ${batchCount} batches, ${allMessages.length} messages`
      );
      break;
    }

    if (messages.length < MAX_DISCORD_MESSAGE) {
      break;
    }

    const lastMessage = messages.at(-1);
    if (!lastMessage?.id) {
      break;
    }

    beforeMessageId = lastMessage.id;
    await sleep(50);
  } while (beforeMessageId);

  return allMessages;
}

/**
 * Fetches new messages from a channel/thread going forward (newer than afterMessageId).
 * Used for incremental updates to get only new messages since last fetch.
 */
async function fetchNewMessagesForward(
  channelOrThreadId: string,
  afterMessageId: string,
  batchSize = MAX_DISCORD_MESSAGE
): Promise<RawDiscordThreadT> {
  let allMessages: RawDiscordThreadT = [];
  let currentAfterId = afterMessageId;

  do {
    const url = `channels/${channelOrThreadId}/messages?limit=${batchSize}&after=${currentAfterId}`;
    const messages = await discordRequest(url);
    allMessages = allMessages.concat(messages);

    if (messages.length < batchSize) {
      break;
    }

    const newestId = messages.at(0)?.id;
    if (!newestId) {
      console.warn(
        `[fetchNewMessagesForward] No message ID in batch for ${channelOrThreadId}, stopping`
      );
      break;
    }

    currentAfterId = newestId;
    await sleep(50);
  } while (currentAfterId);

  return allMessages;
}

/**
 * Caches messages for future stale fallback. Logs warning on failure but doesn't throw.
 */
async function cacheMessagesForFallback(
  channelOrThreadId: string,
  messages: RawDiscordThreadT
): Promise<void> {
  try {
    await setCachedThreadMessages(channelOrThreadId, messages);
  } catch (cacheError) {
    console.warn(
      `[cacheMessagesForFallback] Failed to cache for ${channelOrThreadId}:`,
      cacheError
    );
  }
}

/**
 * Attempts to return stale cached messages. Throws original error if no cache available.
 */
async function getStaleMessagesOrThrow(
  channelOrThreadId: string,
  originalError: unknown
): Promise<MessageFetchResult> {
  console.error(
    `[getStaleMessagesOrThrow] Discord API failed for ${channelOrThreadId}:`,
    originalError instanceof Error ? originalError.message : originalError
  );

  const cachedMessages = await getCachedThreadMessages(channelOrThreadId);

  if (cachedMessages && cachedMessages.length > 0) {
    console.warn(
      `[getStaleMessagesOrThrow] Returning stale data for ${channelOrThreadId} (${cachedMessages.length} messages)`
    );
    return {
      messages: cachedMessages,
      latestMessageId: cachedMessages.at(0)?.id,
      lastMessageId: cachedMessages.at(-1)?.id,
      isStale: true,
    };
  }

  console.error(
    `[getStaleMessagesOrThrow] No cached fallback for ${channelOrThreadId}, throwing`
  );
  throw originalError;
}

function buildMessageFetchResult(
  messages: RawDiscordThreadT
): MessageFetchResult {
  return {
    messages,
    latestMessageId: messages.at(0)?.id,
    lastMessageId: messages.at(-1)?.id,
  };
}

// ============================================================================
// Discord API - Public Message Fetching Functions
// ============================================================================

/**
 * Fetches all messages from a channel/thread with stale fallback on failure.
 * @param oldestTimestamp - Optional cutoff; messages older than this are excluded
 */
export async function getDiscordMessagesPaginated(
  channelOrThreadId: string,
  oldestTimestamp?: number
): Promise<MessageFetchResult> {
  try {
    const messages = await fetchAllMessagesBackward(
      channelOrThreadId,
      oldestTimestamp
    );
    await cacheMessagesForFallback(channelOrThreadId, messages);
    return buildMessageFetchResult(messages);
  } catch (error) {
    return getStaleMessagesOrThrow(channelOrThreadId, error);
  }
}

/**
 * Fetches new messages since a given message ID (incremental update).
 */
export async function getLatestDiscordMessagesPaginated(
  channelOrThreadId: string,
  afterMessageId: string,
  batchSize = MAX_DISCORD_MESSAGE
): Promise<MessageFetchResult> {
  const messages = await fetchNewMessagesForward(
    channelOrThreadId,
    afterMessageId,
    batchSize
  );
  return buildMessageFetchResult(messages);
}

// ============================================================================
// Thread ID Map Building
// ============================================================================

type ThreadKeyAndId = {
  key: string;
  threadId: string;
} | null;

/**
 * Extracts the thread key and ID from a Discord message.
 * Thread name takes precedence over message content (handles edits by admins).
 */
function extractThreadKeyFromMessage(
  message: RawDiscordMessageT
): ThreadKeyAndId {
  if (!message.thread?.id) {
    return null;
  }

  const rawName = message.thread.name ?? message.content;
  const key = extractValidateTitleAndTimestamp(rawName);

  if (!key) {
    return null;
  }

  return { key, threadId: message.thread.id };
}

/**
 * Converts an array of Discord messages into a threadIdMap.
 */
function messagesToThreadIdMap(messages: RawDiscordThreadT): ThreadIdMap {
  return messages.reduce((map, message) => {
    const extracted = extractThreadKeyFromMessage(message);
    if (extracted) {
      map[extracted.key] = extracted.threadId;
    }
    return map;
  }, {} as ThreadIdMap);
}

/**
 * Fetches messages from Discord channel and builds a map of thread keys to thread IDs.
 * If afterMessageId is provided, only fetches new messages (incremental update).
 * Full rebuilds are limited to FULL_REBUILD_LOOKBACK_MS to avoid fetching ancient history.
 */
export async function buildThreadIdMap(afterMessageId?: string): Promise<{
  threadIdMap: ThreadIdMap;
  latestMessageId: string | undefined;
}> {
  const isIncremental = !!afterMessageId;
  const lookbackDays = Math.round(
    FULL_REBUILD_LOOKBACK_MS / (24 * 60 * 60 * 1000)
  );

  console.log(
    `[discord] fetching threads: ${
      isIncremental ? "incremental" : `full (${lookbackDays}d lookback)`
    }`
  );

  const fetchResult = afterMessageId
    ? await getLatestDiscordMessagesPaginated(
        evidenceRationalDiscordChannelId,
        afterMessageId
      )
    : await getDiscordMessagesPaginated(
        evidenceRationalDiscordChannelId,
        Date.now() - FULL_REBUILD_LOOKBACK_MS
      );

  const threadIdMap = messagesToThreadIdMap(fetchResult.messages);

  console.log(
    `[discord] found ${fetchResult.messages.length} messages, ${
      Object.keys(threadIdMap).length
    } threads`
  );

  return {
    threadIdMap,
    latestMessageId: fetchResult.latestMessageId,
  };
}
