import { Redis } from "@upstash/redis";
import { RawDiscordThreadT, ThreadIdMap } from "types";
import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { sleep, stripInvalidCharacters } from "lib/utils";

// Cache configuration
export const THREAD_MAPPING_CACHE_KEY = "discord:thread_mapping";
export const LATEST_THREAD_ID = "discord:latest_thread_id";

const redis = Redis.fromEnv();

// Cache functions for entire thread mapping
export async function getCachedThreadMapping(): Promise<ThreadIdMap | null> {
  try {
    const cached = await redis.get(THREAD_MAPPING_CACHE_KEY);
    if (!cached) return null;

    // Handle both string and parsed object responses from Redis
    if (typeof cached === "string") {
      return JSON.parse(cached) as ThreadIdMap;
    } else if (typeof cached === "object" && cached !== null) {
      return cached as ThreadIdMap;
    }

    return null;
  } catch (error) {
    console.warn("Failed to get cached thread mapping:", error);
    return null;
  }
}

export async function setCachedThreadMapping(
  mapping: ThreadIdMap
): Promise<void> {
  try {
    await redis.set(THREAD_MAPPING_CACHE_KEY, JSON.stringify(mapping));
  } catch (error) {
    console.warn("Failed to cache thread mapping:", error);
  }
}

export async function setCachedLatestThreadId(
  latestThreadId: string
): Promise<void> {
  try {
    await redis.set(LATEST_THREAD_ID, latestThreadId);
  } catch (error) {
    console.warn("Failed to cache latest thread ID:", error);
  }
}

export async function getCachedLatestThreadId(): Promise<string | null> {
  try {
    return await redis.get(LATEST_THREAD_ID);
  } catch (error) {
    console.warn("Failed to get latest thread ID:", error);
    return null;
  }
}

// Retry configuration
const MAX_RETRIES = 10;
const BASE_DELAY = 2_000; // 2 seconds
const MAX_DELAY = 30_000; // 30 seconds

// simple exponential backoff
function calculateBackoffDelay(attempt: number): number {
  const exponentialDelay = BASE_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(MAX_DELAY, exponentialDelay + jitter);
}

export async function discordRequest(
  endpoint: string,
  attempt = 0
): Promise<RawDiscordThreadT> {
  const url = "https://discord.com/api/v10/" + endpoint;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bot ${discordToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "User-Agent":
          "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Discord API error ${res.status} at ${endpoint}: ${errorText}`
      );
    }

    return (await res.json()) as RawDiscordThreadT;
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      console.error(
        `Failed to fetch from Discord API after ${MAX_RETRIES} retries at ${endpoint}:`,
        error
      );
      throw error;
    }

    const delay = calculateBackoffDelay(attempt);
    console.warn(
      `Discord API error at ${endpoint}, retrying in ${delay}ms (attempt ${
        attempt + 1
      }/${MAX_RETRIES}):`,
      error
    );
    await sleep(delay);

    return await discordRequest(endpoint, attempt + 1);
  }
}

// fetches messages for thread (or channel) in batches
// starts from latest
export async function getDiscordMessagesPaginated(
  channelOrThreadId: string,
  batchSize = 100 // 0-100
): Promise<{
  messages: RawDiscordThreadT;
  latestMessageId: string | undefined;
  lastMessageId: string | undefined;
}> {
  let allMessages: RawDiscordThreadT = [];
  let lastMessageId: string | undefined = undefined;

  do {
    let url = `channels/${channelOrThreadId}/messages?limit=${batchSize}`;

    if (lastMessageId) {
      // For subsequent requests, use 'before' to get older messages
      url += `&before=${lastMessageId}`;
    }

    const messages = await discordRequest(url);

    allMessages = allMessages.concat(messages);

    if (messages.length < batchSize) {
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
  await Promise.all([
    setCachedThreadMapping(threadIdMap),
    ...(allThreadMessages.latestMessageId
      ? [setCachedLatestThreadId(allThreadMessages.latestMessageId)]
      : []),
  ]);

  return threadIdMap;
}

// Main function to get thread messages with cache handling
export async function getThreadMessagesForRequest(requestKey: string): Promise<{
  threadId: string | null;
  messages: RawDiscordThreadT;
}> {
  // Try to get thread ID from cache first
  const threadId = await getThreadIdFromCache(requestKey);
  if (threadId) {
    const messages = await getDiscordMessagesPaginated(threadId);
    return { threadId, messages: messages.messages };
  }

  // Thread not found in cache, try to update mapping and find it
  const updatedThreadId = await findThreadIdAfterCacheUpdate(requestKey);
  if (updatedThreadId) {
    const messages = await getDiscordMessagesPaginated(updatedThreadId);
    return { threadId: updatedThreadId, messages: messages.messages };
  }

  // Thread not found even after updating the map
  return { threadId: null, messages: [] };
}

// Helper function to get thread ID from cache
async function getThreadIdFromCache(
  requestKey: string
): Promise<string | null> {
  const cachedThreadMapping = await getCachedThreadMapping();
  return cachedThreadMapping?.[requestKey] || null;
}

// Helper function to find thread ID after updating cache
async function findThreadIdAfterCacheUpdate(
  requestKey: string
): Promise<string | null> {
  const latestThreadId = await getCachedLatestThreadId();

  if (latestThreadId) {
    // Rebuild the thread ID map with messages after the latest cached message
    const updatedThreadMapping = await buildThreadIdMap(latestThreadId);
    return updatedThreadMapping[requestKey] || null;
  } else {
    // No latest thread ID in cache, rebuild the entire map
    const fullThreadMapping = await buildThreadIdMap();
    return fullThreadMapping[requestKey] || null;
  }
}

// discord truncates the title length after 72 characters
function extractValidateTitleAndTimestamp(msg?: string) {
  // All messages are structured with the unixtimestamp at the end, such as
  // Across Dispute November 24th 2022 at 1669328675
  if (msg === undefined || msg === null) return null;
  const time = parseInt(msg.substring(msg.length - 10, msg.length));
  const title = msg.slice(0, -13);

  // All times must be newer than 2021-01-01 and older than the current time.
  const isTimeValid =
    new Date(time).getTime() > 1577858461 && time < Date.now();

  // use "title-timstamp" to find thread
  return isTimeValid ? makeKey(title, time) : null;
}

export function makeKey(title: string, timestamp: string | number) {
  const cleanedTitle = stripInvalidCharacters(truncateTitle(title));
  return `${cleanedTitle}-${String(timestamp)}`.replaceAll(" ", "");
}

function truncateTitle(title: string) {
  return title.substring(0, 60);
}
