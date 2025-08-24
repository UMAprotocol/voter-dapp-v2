import { Redis } from "@upstash/redis";
import { RawDiscordThreadT, ThreadIdMap } from "types";
import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { sleep, stripInvalidCharacters } from "lib/utils";

// Cache configuration
export const THREAD_CACHE_KEY = "discord:thread_cache";
const MAX_DISCORD_MESSAGE = 100; // 0-100
type ThreadCache = {
  threadIdMap: ThreadIdMap;
  latestThreadId: string | null;
};

// singleton
let redis: Redis | undefined;
export function getRedis(): Redis {
  redis ??= Redis.fromEnv();
  return redis;
}

// Cache functions for thread cache object
export async function getCachedThreadIdMap(): Promise<ThreadCache | null> {
  const redis = getRedis();
  return await redis.get<ThreadCache>(THREAD_CACHE_KEY);
}

export async function setCachedThreadIdMap(
  threadIdMap: ThreadIdMap,
  latestThreadId: string | null
) {
  const redis = getRedis();
  const result = await redis.set(THREAD_CACHE_KEY, {
    threadIdMap,
    latestThreadId,
  });
  if (!result) {
    throw new Error("Setting threadIdMap cache failed");
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
      finalError = error;
      if (attempt >= MAX_RETRIES) {
        break;
      }

      const delay = calculateBackoffDelay(attempt);
      console.warn(
        `Discord API error at ${endpoint}, retrying in ${delay}ms (attempt ${
          attempt + 1
        }/${MAX_RETRIES}):`,
        error
      );
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
}> {
  // Try to get thread ID from cache first
  const threadId = await getThreadIdFromCache(requestKey);
  if (!threadId) {
    return { threadId: null, messages: [] };
  }

  const { messages } = await getDiscordMessagesPaginated(threadId);
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

// discord truncates the title length after 72 characters
function extractValidateTitleAndTimestamp(msg?: string) {
  // All messages are structured with the unixtimestamp at the end, such as
  // Across Dispute November 24th 2022 at 1669328675
  if (!msg) return null;
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
