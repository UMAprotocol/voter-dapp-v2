import { NextApiRequest, NextApiResponse } from "next";
import {
  VoteDiscussionT,
  DiscordMessageT,
  RawDiscordMessageT,
  L1Request,
} from "types";

import * as ss from "superstruct";
import { APIEmbed } from "discord-api-types/v10";
import { stripInvalidCharacters } from "lib/utils";
import {
  getThreadMessagesForRequest,
  refreshThreadMessagesForRequestKey,
} from "./_utils";
import { makeKey } from "lib/discord-utils";
import { waitUntil } from "@vercel/functions";

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

async function fetchDiscordThread(
  l1Request: L1Request
): Promise<VoteDiscussionT & { isStaleData?: boolean }> {
  // Create the request key using the same logic as before
  const requestedId = makeKey(l1Request.title, l1Request.time);

  // Use the new cache-aware function to get thread messages
  const { messages, isStaleData } = await getThreadMessagesForRequest(
    requestedId
  );

  // First, process all messages into a flat structure
  const allProcessedMessages: (DiscordMessageT & {
    referencedMessageId?: string;
  })[] = messages
    .filter((message) => message.content != "")
    .map((msg: RawDiscordMessageT) => {
      try {
        const sanitized = fixMarkdownBold(stripMarkdownHeaders(msg.content));
        return {
          message: concatenateAttachments(
            replaceEmbeds(
              replaceMentions(sanitized, msg.mentions || []),
              msg.embeds || []
            ),
            msg.attachments || []
          ),
          sender: msg.author?.username || "Unknown",
          senderPicture: discordPhoto(msg.author?.id, msg.author?.avatar),
          time: Math.floor(new Date(msg.timestamp).getTime() / 1000),
          id: msg.id,
          referencedMessageId: msg.message_reference?.message_id,
        };
      } catch (error) {
        console.warn("Failed to process Discord message:", error, msg);
        return null;
      }
    })
    .filter(Boolean) as (DiscordMessageT & { referencedMessageId?: string })[];

  // Create a map of all messages by ID for quick lookup
  const messageMap = new Map<
    string,
    DiscordMessageT & { referencedMessageId?: string }
  >();
  allProcessedMessages.forEach((msg) => messageMap.set(msg.id, msg));

  // Helper function to find the root parent message ID
  function findRootParentId(messageId: string): string {
    const message = messageMap.get(messageId);
    if (!message || !message.referencedMessageId) {
      return messageId; // This is the root message
    }
    // Recursively find the root parent
    return findRootParentId(message.referencedMessageId);
  }

  // Separate top-level messages and replies
  const topLevelMessages: DiscordMessageT[] = [];
  const repliesMap = new Map<string, DiscordMessageT[]>();
  const orphanedReplies: DiscordMessageT[] = [];

  for (const message of allProcessedMessages) {
    const { referencedMessageId, ...cleanMessage } = message;

    if (!referencedMessageId) {
      // This is a top-level message
      topLevelMessages.push({
        ...cleanMessage,
        replies: [],
      } as DiscordMessageT);
    } else {
      // This is a reply - find the root parent message
      const rootParentId = findRootParentId(referencedMessageId);

      const rootParent = messageMap.get(rootParentId);
      if (rootParent && !rootParent.referencedMessageId) {
        // Root parent exists and is a top-level message, add to replies map
        const existingReplies = repliesMap.get(rootParentId) || [];
        existingReplies.push(cleanMessage);
        repliesMap.set(rootParentId, existingReplies);
      } else {
        // Root parent doesn't exist in our current batch or isn't top-level - treat as orphaned reply
        console.warn(
          `Orphaned reply found: ${message.id} references missing or non-top-level parent chain ending at ${rootParentId}`
        );
        orphanedReplies.push(cleanMessage);
      }
    }
  }

  // Attach replies to their parent messages
  const finalMessages = topLevelMessages.map((message) => {
    const replies = repliesMap.get(message.id) || [];
    return {
      ...message,
      replies: replies,
    };
  });

  // Add orphaned replies as top-level messages at the end
  // This ensures no replies are lost even if their parent isn't in our batch
  orphanedReplies.forEach((orphanedReply) => {
    finalMessages.push({ ...orphanedReply, replies: [] });
  });

  if (isStaleData) {
    console.warn(
      `[discord-thread] Handler returning STALE data for requestKey=${requestedId}, threadMessages=${finalMessages.length}`
    );
  } else {
    console.info(
      `[discord-thread] Handler returning FRESH data for requestKey=${requestedId}, threadMessages=${finalMessages.length}`
    );
  }

  return {
    identifier: l1Request.identifier,
    time: l1Request.time,
    thread: finalMessages,
    isStaleData,
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    // Validate required query parameters
    const time = Number(request.query.time);
    if (isNaN(time) || time <= 0) {
      return response.status(400).send({
        message: "Invalid time parameter - must be a positive number",
      });
    }

    const identifier = request.query.identifier;
    if (!identifier || typeof identifier !== "string") {
      return response.status(400).send({
        message: "Invalid identifier parameter - must be a string",
      });
    }

    const title = request.query.title?.toString().trim() || "";
    if (!title) {
      return response.status(400).send({
        message: "Invalid title parameter - cannot be empty",
      });
    }

    const body = ss.create(
      {
        l1Request: {
          time,
          identifier,
          title: stripInvalidCharacters(title),
        },
      },
      DiscordThreadRequestBody
    );

    const voteDiscussion: VoteDiscussionT & { isStaleData?: boolean } =
      await fetchDiscordThread(body.l1Request);
    console.info(
      `[discord-thread] Response prepared for identifier=${
        voteDiscussion.identifier
      }, time=${voteDiscussion.time}, messages=${
        voteDiscussion.thread.length
      }, isStale=${voteDiscussion.isStaleData ? "true" : "false"}`
    );
    const requestKey = makeKey(body.l1Request.title, body.l1Request.time);
    response
      .setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=300, stale-while-revalidate=300"
      )
      .status(200)
      .send(voteDiscussion);
    if (voteDiscussion.isStaleData) {
      console.info(
        `[discord-thread] Scheduling background refresh via waitUntil for requestKey=${requestKey}`
      );
      waitUntil(refreshThreadMessagesForRequestKey(requestKey));
    }
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error fetching discord thread data",
      error: e instanceof Error ? e.message : e,
    });
  }
}
