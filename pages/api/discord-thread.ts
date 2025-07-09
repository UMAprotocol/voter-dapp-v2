import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { NextApiRequest, NextApiResponse } from "next";
import {
  VoteDiscussionT,
  RawDiscordThreadT,
  DiscordMessageT,
  RawDiscordMessageT,
  L1Request,
} from "types";

import * as ss from "superstruct";
import { APIEmbed } from "discord-api-types/v10";
import { stripInvalidCharacters } from "lib/utils";

// converts markdown headers #, ## and ### to bold instead so we dont render large text in discussion panel
export function stripMarkdownHeaders(message: string): string {
  return message.replace(
    /#{1,3}\s+(.*?)$/gm,
    (_, p1: string) => `**${p1.trim()}**`
  );
}
// fixes misformated **bolds**. any whitespace between ** for some reason does not get interpreted as bold
export function fixMarkdownBold(message: string): string {
  return message.replace(
    /\*\*(.*?)\*\*/g,
    (_, p1: string) => `**${p1.trim()}**`
  );
}
export const DiscordThreadRequestBody = ss.object({ l1Request: L1Request });
export type DiscordThreadRequestBody = ss.Infer<
  typeof DiscordThreadRequestBody
>;

if (discordToken === "") throw Error("DISCORD_TOKEN env variable not set!");

export async function discordRequest(endpoint: string) {
  return backoffWithRetry(async () => {
    const url = "https://discord.com/api/v10/" + endpoint;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bot ${discordToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "User-Agent":
          "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
      },
    });

    if (!res.ok) {
      throw new Error(
        `Unable to fetch messages from discord at ${endpoint} (${res.status})`,
        {
          cause: await res.text(),
        }
      );
    }

    return (await res.json()) as RawDiscordThreadT;
  });
}

export async function getDiscordMessages(threadId: string, limit = 100) {
  return discordRequest(`channels/${threadId}/messages?limit=${limit}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exponential backoff with jitter to handle rate limiting
async function backoffWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a rate limit error (429 status)
      if (error instanceof Error && error.message.includes("429")) {
        if (attempt === maxRetries) {
          throw error; // Give up after max retries
        }

        // Calculate exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(
          `Rate limited, retrying in ${Math.round(delay)}ms (attempt ${
            attempt + 1
          }/${maxRetries + 1})`
        );
        await sleep(delay);
        continue;
      }

      // For non-rate-limit errors, throw immediately
      throw error;
    }
  }

  throw lastError!;
}

// fetch messages from any Discord channel/thread 100 at a time until limit is reached
export async function getDiscordMessagesPaginated(
  channelOrThreadId: string,
  limit = 100
) {
  let allMessages: RawDiscordThreadT = [];
  let lastMessageId: string | undefined = undefined;
  do {
    let url = `channels/${channelOrThreadId}/messages?limit=${limit}`;
    if (lastMessageId) {
      url += `&before=${lastMessageId}`;
    }
    const messages = await discordRequest(url);

    allMessages = allMessages.concat(messages);

    if (messages.length < limit) {
      break; // No more messages to fetch
    }
    lastMessageId = messages[messages.length - 1]?.id; // Get the last message ID
    await sleep(100); // Reduced sleep time since we have proper backoff handling
  } while (lastMessageId);
  return allMessages;
}

function discordPhoto(userId: string, userAvatar: string | null) {
  if (!userId || !userAvatar) return undefined;
  return `https://cdn.discordapp.com/avatars/${userId}/${userAvatar}`;
}
// messages by default use userids when mentioning other users in the format <@id>. Fortunately
// messages also have the list of mentions with ids and usernames. This function swaps ids for usernames.
function replaceMentions(
  message: string,
  mentions: { id: string; username: string }[]
) {
  let result = message;
  for (const entry of mentions) {
    result = result.replace(`<@${entry.id}>`, `**@${entry.username}**`);
  }
  return result;
}

function replaceEmbeds(message: string, embeds: APIEmbed[]) {
  let result = message;
  for (const embed of embeds) {
    if (embed?.url && embed?.title) {
      result = result.replace(
        `(${embed.url})`,
        `[${embed.title}](${embed.url})`
      );
    }
  }
  return result;
}

function concatenateAttachments(
  message: string,
  attachments: {
    id: string;
    filename: string;
    proxy_url: string;
    url: string;
  }[]
) {
  const concat: string[] = [];
  attachments.forEach((attachment, index) => {
    concat.push(
      `[Link ${index + 1}](${attachment.url || attachment.proxy_url})`
    );
  });

  return [message, concat.join(",  ")].join("\n");
}

function truncateTitle(title: string) {
  return title.substring(0, 60);
}

function makeKey(title: string, timestamp: string | number) {
  const cleanedTitle = stripInvalidCharacters(truncateTitle(title));
  return `${cleanedTitle}-${String(timestamp)}`.replaceAll(" ", "");
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

async function fetchDiscordThread(
  l1Request: L1Request
): Promise<VoteDiscussionT> {
  // First, fetch all messages in the evidence rational channel.
  // Paginate through all available messages to ensure we don't miss any threads
  const threadMsg = await getDiscordMessagesPaginated(
    evidenceRationalDiscordChannelId
  );
  // Then, extract the timestamp from each message and for each timestamp relate
  // it to the associated threadId.
  const timeToThread: { [key: string]: string | undefined } = {};
  threadMsg.forEach((message) => {
    // if for some reason the thread was changed, it will only reflect in thread.name.
    // message.content only reflects the original message, not edits ( or edits by another admin)
    // so first check for message.thread.name and fallback to message.content
    const titleAndTimstamp = extractValidateTitleAndTimestamp(
      message?.thread?.name ?? message.content
    );

    if (titleAndTimstamp) timeToThread[titleAndTimstamp] = message.thread?.id;
  });

  // Associate the threadId with each title-timestamp provided in the payload.
  const requestedId = makeKey(l1Request.title, l1Request.time);

  const threadId = timeToThread?.[requestedId];

  let messages: RawDiscordThreadT = [];
  if (threadId) {
    messages = await getDiscordMessagesPaginated(threadId);
  }

  const processedMessages: DiscordMessageT[] = messages
    .filter((message) => message.content != "")
    .map((msg: RawDiscordMessageT) => {
      const sanitized = fixMarkdownBold(stripMarkdownHeaders(msg.content));
      return {
        message: concatenateAttachments(
          replaceEmbeds(replaceMentions(sanitized, msg.mentions), msg.embeds),
          msg.attachments
        ),
        sender: msg.author.username,
        senderPicture: discordPhoto(msg.author.id, msg.author.avatar),
        time: Math.floor(new Date(msg.timestamp).getTime() / 1000),
      };
    });

  return {
    identifier: l1Request.identifier,
    time: l1Request.time,
    thread: processedMessages,
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=604800, s-maxage=604800");

  try {
    const body = ss.create(
      {
        l1Request: {
          time: Number(request.query.time),
          identifier: request.query.identifier,
          title: stripInvalidCharacters(
            request.query.title?.toString().trim() || ""
          ),
        },
      },
      DiscordThreadRequestBody
    );

    const voteDiscussion: VoteDiscussionT = await fetchDiscordThread(
      body.l1Request
    );
    response.status(200).send(voteDiscussion);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error fetching discord thread data",
      error: e instanceof Error ? e.message : e,
    });
  }
}
