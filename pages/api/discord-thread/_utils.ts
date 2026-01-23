import { Redis } from "@upstash/redis";
import { RawDiscordThreadT, ThreadIdMap, VoteDiscussionT } from "types";
import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { sleep } from "lib/utils";
import { extractValidateTitleAndTimestamp } from "lib/discord-utils";
import { createCacheKey } from "lib/cache-keys";

// Cache configuration
export const THREAD_CACHE_KEY = createCacheKey("discord:thread_cache");
export const THREAD_MESSAGES_CACHE_KEY = createCacheKey(
  "discord:thread_messages"
);
export const PROCESSED_THREAD_CACHE_KEY = createCacheKey(
  "discord:processed_thread"
);
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
  return await redis.get<VoteDiscussionT>(cacheKey);
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

export async function buildThreadIdMap(afterMessageId?: string): Promise<{
  threadIdMap: ThreadIdMap;
  latestMessageId: string | undefined;
}> {
  console.log(
    `[buildThreadIdMap] Starting build, afterMessageId=${
      afterMessageId ?? "none"
    }`
  );

  const allThreadMessages = afterMessageId
    ? await getLatestDiscordMessagesPaginated(
        evidenceRationalDiscordChannelId,
        afterMessageId
      )
    : await getDiscordMessagesPaginated(evidenceRationalDiscordChannelId);

  console.log(
    `[buildThreadIdMap] Fetched ${allThreadMessages.messages.length} messages from Discord channel`
  );

  const threadIdMap: ThreadIdMap = allThreadMessages.messages.reduce(
    (map, message) => {
      // if for some reason the thread was changed, it will only reflect in thread.name.
      // message.content only reflects the original message, not edits ( or edits by another admin)
      // so first check for message.thread.name and fallback to message.content
      const rawName = message?.thread?.name ?? message.content;
      const titleAndTimestamp = extractValidateTitleAndTimestamp(rawName);

      if (message.thread?.id) {
        console.log(
          `[buildThreadIdMap] Thread: "${rawName?.slice(0, 60)}..." -> key: "${
            titleAndTimestamp ?? "invalid"
          }" -> id: ${message.thread.id}`
        );
      }

      if (titleAndTimestamp && message.thread?.id) {
        map[titleAndTimestamp] = message.thread.id;
      }
      return map;
    },
    {} as ThreadIdMap
  );

  console.log(
    `[buildThreadIdMap] Built map with ${
      Object.keys(threadIdMap).length
    } valid thread mappings`
  );

  return {
    threadIdMap,
    latestMessageId: allThreadMessages.latestMessageId,
  };
}
