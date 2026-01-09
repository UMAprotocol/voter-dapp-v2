import { Redis } from "@upstash/redis";
import { RawDiscordThreadT, ThreadIdMap } from "types";
import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { sleep } from "lib/utils";
import { extractValidateTitleAndTimestamp } from "lib/discord-utils";
import { createCacheKey } from "lib/cache-keys";

// Cache configuration
export const THREAD_CACHE_KEY = createCacheKey("discord:thread_cache");
export const THREAD_MESSAGES_CACHE_KEY = createCacheKey(
  "discord:thread_messages"
);
// Simple lock to prevent thundering herd refresh
const THREAD_REFRESH_LOCK_PREFIX = createCacheKey(
  "discord:thread_refresh_lock"
);
const DEFAULT_LOCK_TTL_SECONDS = 300; // 5 minutes
const MAX_DISCORD_MESSAGE = 100; // 0-100
type ThreadCache = {
  threadIdMap: ThreadIdMap;
  latestThreadId: string | null;
};

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
export async function getCachedThreadIdMap(): Promise<ThreadCache | null> {
  if (DISABLE_REDIS) {
    return null;
  }
  const redis = getRedis();
  if (!redis) return null;
  return await redis.get<ThreadCache>(THREAD_CACHE_KEY);
}

export async function setCachedThreadIdMap(
  threadIdMap: ThreadIdMap,
  latestThreadId: string | null
) {
  if (DISABLE_REDIS) {
    return;
  }
  const redis = getRedis();
  if (!redis) return;
  const result = await redis.set(THREAD_CACHE_KEY, {
    threadIdMap,
    latestThreadId,
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
  return await redis.get<RawDiscordThreadT>(cacheKey);
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

const MAX_RETRIES = 5;
const BASE_DELAY = 1_000; // 2 seconds
const MAX_DELAY = 30_000; // 30 seconds

// simple exponential backoff
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
    return Math.ceil(seconds * 1000); // Convert to milliseconds
  }

  // fallback
  return calculateBackoffDelay(attempt);
}

export async function discordRequest(
  endpoint: string
): Promise<RawDiscordThreadT> {
  let attempt = 1;
  let finalError: unknown;
  const url = "https://discord.com/api/v10/" + endpoint;

  while (attempt <= MAX_RETRIES) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "User-Agent": "DiscordBot (https://vote.uma.xyz, 1.0.0)",
        },
      });

      // Handle rate limits
      if (res.status === 429) {
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
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Discord API error ${res.status} at ${endpoint}: ${errorText}`
        );
      }

      console.log(
        `Discord API at ${endpoint} successful after ${attempt + 1} retries`
      );

      return (await res.json()) as RawDiscordThreadT;
    } catch (error) {
      finalError = error;

      if (attempt >= MAX_RETRIES) {
        break;
      }

      const delay = calculateBackoffDelay(attempt);
      console.warn("Discord thread retrying for non-429 error", error);
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

// fetches messages for thread (or channel) in batches
// starts from latest
export async function getDiscordMessagesPaginated(
  channelOrThreadId: string
): Promise<{
  messages: RawDiscordThreadT;
  latestMessageId: string | undefined;
  lastMessageId: string | undefined;
}> {
  let allMessages: RawDiscordThreadT = [];
  let lastMessageId: string | undefined = undefined;

  do {
    let url = `channels/${channelOrThreadId}/messages?limit=${MAX_DISCORD_MESSAGE}`;

    if (lastMessageId) {
      // For subsequent requests, use 'before' to get older messages
      url += `&before=${lastMessageId}`;
    }

    const messages = await discordRequest(url);

    allMessages = allMessages.concat(messages);

    if (messages.length < MAX_DISCORD_MESSAGE) {
      break; // No more messages to fetch
    }

    const lastMessage = messages.at(-1);
    if (!lastMessage?.id) {
      console.warn(
        `No message ID found in batch for ${channelOrThreadId}, stopping pagination`
      );
      break; // Safety check to prevent infinite loop
    }

    lastMessageId = lastMessage.id;
    await sleep(50);
  } while (lastMessageId);

  // Cache the messages for future stale data fallback
  try {
    await setCachedThreadMessages(channelOrThreadId, allMessages);
  } catch (cacheError) {
    console.warn(
      `Failed to cache messages for thread ${channelOrThreadId}:`,
      cacheError
    );
  }

  return {
    messages: allMessages,
    latestMessageId: allMessages.at(0)?.id,
    lastMessageId: allMessages.at(-1)?.id,
  };
}

export async function getLatestDiscordMessagesPaginated(
  channelOrThreadId: string,
  latestMessageId: string,
  batchSize = 100 // 0-100
): Promise<{
  messages: RawDiscordThreadT;
  latestMessageId: string | undefined;
  lastMessageId: string | undefined;
}> {
  let allMessages: RawDiscordThreadT = [];
  let lastMessageId = latestMessageId;

  do {
    const url = `channels/${channelOrThreadId}/messages?limit=${batchSize}&after=${lastMessageId}`;

    const messages = await discordRequest(url);

    allMessages = allMessages.concat(messages);

    if (messages.length < batchSize) {
      break; // No more messages to fetch
    }

    const latestId = messages.at(0)?.id;
    if (!latestId) {
      console.warn(
        `No message ID found in batch for ${channelOrThreadId}, stopping pagination`
      );
      break; // Safety check to prevent infinite loop
    }

    lastMessageId = latestId;
    await sleep(50);
  } while (lastMessageId);

  return {
    messages: allMessages,
    latestMessageId: allMessages.at(0)?.id,
    lastMessageId: allMessages.at(-1)?.id,
  };
}

export async function buildThreadIdMap(
  afterMessageId?: string
): Promise<ThreadIdMap> {
  const allThreadMessages = afterMessageId
    ? await getLatestDiscordMessagesPaginated(
        evidenceRationalDiscordChannelId,
        afterMessageId
      )
    : await getDiscordMessagesPaginated(evidenceRationalDiscordChannelId);

  const threadIdMap: ThreadIdMap = allThreadMessages.messages.reduce(
    (map, message) => {
      // if for some reason the thread was changed, it will only reflect in thread.name.
      // message.content only reflects the original message, not edits ( or edits by another admin)
      // so first check for message.thread.name and fallback to message.content
      const titleAndTimestamp = extractValidateTitleAndTimestamp(
        message?.thread?.name ?? message.content
      );
      if (titleAndTimestamp && message.thread?.id) {
        map[titleAndTimestamp] = message.thread.id;
      }
      return map;
    },
    {} as ThreadIdMap
  );

  // Use the unified cache to store both thread mapping and latest thread ID atomically
  await setCachedThreadIdMap(
    threadIdMap,
    allThreadMessages.latestMessageId || null
  );

  return threadIdMap;
}

// Main function to get thread messages with cache handling
export async function getThreadMessagesForRequest(requestKey: string): Promise<{
  threadId: string | null;
  messages: RawDiscordThreadT;
  isStaleData?: boolean;
}> {
  // Try to get thread ID from cache first
  const threadId = await getThreadIdFromCache(requestKey);
  if (!threadId) {
    console.warn(
      `[discord-thread] No threadId for requestKey=${requestKey}; returning empty`
    );
    return { threadId: null, messages: [] };
  }
  // Cache-first: if we already have messages cached, return them immediately.
  const cachedMessages = await getCachedThreadMessages(threadId);
  if (cachedMessages && cachedMessages.length > 0) {
    console.info(
      `[discord-thread] Serving STALE cached data for requestKey=${requestKey}, threadId=${threadId}, messages=${cachedMessages.length}`
    );
    return { threadId, messages: cachedMessages, isStaleData: true };
  }
  // Cold cache: fetch now (this path is rare and acceptable to be blocking)
  console.info(
    `[discord-thread] Cold cache MISS for requestKey=${requestKey}, threadId=${threadId}. Fetching fresh from Discord...`
  );
  const startedAt = Date.now();
  const { messages } = await getDiscordMessagesPaginated(threadId);
  console.info(
    `[discord-thread] Cold fetch COMPLETE for requestKey=${requestKey}, threadId=${threadId}, messages=${
      messages.length
    }, durationMs=${Date.now() - startedAt}`
  );
  return { threadId, messages };
}

async function getThreadIdFromCache(
  requestKey: string
): Promise<string | null> {
  const cachedThreadMapping = await getCachedThreadIdMap();
  const threadId = cachedThreadMapping?.threadIdMap[requestKey];
  if (!threadId) {
    const updatedThreadMapping = await buildThreadIdMap(
      cachedThreadMapping?.latestThreadId ?? undefined
    );
    return updatedThreadMapping?.[requestKey] ?? null;
  }
  return threadId;
}

function getThreadLockKeyForRequestKey(requestKey: string): string {
  return `${THREAD_REFRESH_LOCK_PREFIX}:${requestKey}`;
}

type SetCommandOptions = Parameters<Redis["set"]>[2];

async function acquireLock(
  lockKey: string,
  ttlSeconds = DEFAULT_LOCK_TTL_SECONDS
): Promise<boolean> {
  if (DISABLE_REDIS) {
    // When Redis is disabled, always allow refresh (no locking)
    return true;
  }
  const redis = getRedis();
  if (!redis) return true;
  try {
    // Use NX + EX to create a simple mutex
    const options: SetCommandOptions = {
      nx: true,
      ex: ttlSeconds,
    } as SetCommandOptions;
    const result = await redis.set(lockKey, "1", options);
    return Boolean(result);
  } catch (e) {
    console.warn(`Failed to acquire lock ${lockKey}:`, e);
    return false;
  }
}

async function releaseLock(lockKey: string) {
  if (DISABLE_REDIS) {
    return;
  }
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(lockKey);
  } catch (e) {
    console.warn(`Failed to release lock ${lockKey}:`, e);
  }
}

// Trigger a refresh, but only if no other worker is already doing it
export async function refreshThreadMessagesForRequestKey(requestKey: string) {
  const lockKey = getThreadLockKeyForRequestKey(requestKey);
  console.info(
    `[discord-thread] Refresh attempt for requestKey=${requestKey}, lockKey=${lockKey}`
  );
  const locked = await acquireLock(lockKey);
  if (!locked) {
    console.info(
      `[discord-thread] Refresh SKIPPED (lock held) for requestKey=${requestKey}, lockKey=${lockKey}`
    );
    return; // another worker is already refreshing
  }
  try {
    const threadId = await getThreadIdFromCache(requestKey);
    if (!threadId) {
      console.warn(
        `[discord-thread] Refresh ABORTED: no threadId for requestKey=${requestKey}`
      );
      return;
    }
    const startedAt = Date.now();
    console.info(
      `[discord-thread] Refresh START for requestKey=${requestKey}, threadId=${threadId}`
    );
    const { messages } = await getDiscordMessagesPaginated(threadId);
    console.info(
      `[discord-thread] Refresh COMPLETE for requestKey=${requestKey}, threadId=${threadId}, messages=${
        messages.length
      }, durationMs=${Date.now() - startedAt}`
    );
  } catch (e) {
    console.warn(`Background refresh failed for ${requestKey}:`, e);
  } finally {
    await releaseLock(lockKey);
  }
}
