import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { NextApiRequest, NextApiResponse } from "next";
import {
  DiscordThreadT,
  RawDiscordThreadT,
  DiscordMessageT,
  RawDiscordMessageT,
  L1Request,
} from "types";

import * as ss from "superstruct";

export const DiscordThreadRequestBody = ss.object({ l1Request: L1Request });
export type DiscordThreadRequestBody = ss.Infer<
  typeof DiscordThreadRequestBody
>;

if (discordToken === "") throw Error("DISCORD_TOKEN env variable not set!");

export async function discordRequest(endpoint: string) {
  const url = "https://discord.com/api/v10/" + endpoint;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${discordToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
  });

  return (await res.json()) as RawDiscordThreadT;
}

export async function getDiscordMessages(threadId: string) {
  return discordRequest(`channels/${threadId}/messages`);
}

function discordPhoto(userId: string, userAvatar: string) {
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
function replaceEmbeds(
  message: string,
  embeds: { url: string; title: string; type: string }[]
) {
  let result = message;
  for (const embed of embeds) {
    result = result.replace(`(${embed.url})`, `[${embed.title}](${embed.url})`);
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
      `[Link ${index + 1}](${attachment.proxy_url || attachment.url})`
    );
  });

  return [message, concat.join(",  ")].join("\n");
}

function extractValidateTimestamp(msg: string) {
  // All messages are structured with the unixtimestamp at the end, such as
  // Across Dispute November 24th 2022 at 1669328675
  const time = parseInt(msg.substring(msg.length - 10, msg.length));
  // All times must be newer than 2021-01-01 and older than the current time.
  const isValid = new Date(time).getTime() > 1577858461 && time < Date.now();
  return isValid ? time : null;
}

async function fetchDiscordThread(
  l1Request: L1Request
): Promise<DiscordThreadT> {
  // First, fetch all messages in the evidence rational channel.
  const threadMsg = await getDiscordMessages(evidenceRationalDiscordChannelId);
  // Then, extract the timestamp from each message and for each timestamp relate
  // it to the associated threadId.
  const timeToThread: { [key: string]: string } = {};
  threadMsg.forEach((message) => {
    const time = extractValidateTimestamp(message.content);
    if (time) timeToThread[time.toString()] = message.thread.id;
  });
  // Associate the threadId with each timestamp provided in the payload.
  const requestsToThread: { [key: string]: string } = {};
  const time = l1Request.time.toString();
  if (timeToThread[time]) requestsToThread[time] = timeToThread[time];
  else requestsToThread[time] = "";

  let messages: RawDiscordThreadT = [];
  if (requestsToThread[time] !== "")
    messages = await getDiscordMessages(requestsToThread[time]);

  const processedMessages: DiscordMessageT[] = messages
    .filter((message) => message.content != "")
    .map((msg: RawDiscordMessageT) => {
      return {
        message: concatenateAttachments(
          replaceEmbeds(replaceMentions(msg.content, msg.mentions), msg.embeds),
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
    thread: processedMessages.reverse(),
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body = ss.create(request.body, DiscordThreadRequestBody);
    const discordMessages: DiscordThreadT = await fetchDiscordThread(
      body.l1Request
    );
    response.status(200).send(discordMessages);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error fetching discord thread data",
      error: e instanceof Error ? e.message : e,
    });
  }
}
