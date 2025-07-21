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
import { getThreadMessagesForRequest, makeKey } from "./_utils";

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
): Promise<VoteDiscussionT> {
  // Create the request key using the same logic as before
  const requestedId = makeKey(l1Request.title, l1Request.time);

  // Use the new cache-aware function to get thread messages
  const { messages } = await getThreadMessagesForRequest(requestedId);

  const processedMessages: DiscordMessageT[] = messages
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
        };
      } catch (error) {
        console.warn("Failed to process Discord message:", error, msg);
        return null;
      }
    })
    .filter(Boolean) as DiscordMessageT[];

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
  response.setHeader("Cache-Control", "max-age=0, s-maxage=180");

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
