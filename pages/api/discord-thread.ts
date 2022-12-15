import { discordToken, evidenceRationalDiscordChannelId } from "constant";
import { NextApiRequest, NextApiResponse } from "next";
import { PriceRequestT } from "types";

interface RawMessage {
  content: string;
  author: {
    username: string;
    id: string;
    avatar: string;
  };
  timestamp: string;
  thread: { id: string };
}

type RawThread = RawMessage[];

interface ProcessedMessage {
  message: string;
  sender: string;
  senderPicture: string | null;
  time: string;
}

interface ProcessedThread {
  identifier: string;
  time: number;
  thread: ProcessedMessage[];
}

export async function discordRequest(endpoint: string) {
  const url = "https://discord.com/api/v10/" + endpoint;
  if (discordToken === "") throw Error("DISCORD_TOKEN env variable not set!");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${discordToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
  });

  return (await res.json()) as RawThread;
}

export async function getDiscordMessages(threadId: string) {
  return discordRequest(`channels/${threadId}/messages`);
}

function discordPhoto(userId: string, userAvatar: string) {
  if (!userId || !userAvatar) return null;
  return `https://cdn.discordapp.com/avatars/${userId}/${userAvatar}`;
}

function extractValidateTimestamp(msg: string) {
  // All messages are structured with the unixtimestamp at the end, such as
  // Across Dispute November 24th 2022 at 1669328675
  const time = parseInt(msg.substring(msg.length - 10, msg.length));
  // All times must be newer than 2021-01-01 and older than the current time.
  const isValid = new Date(time).getTime() > 1577858461 && time < Date.now();
  return isValid ? time : null;
}

async function fetchDiscordData(l1Requests: PriceRequestT[]) {
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
  l1Requests.forEach((l1Request: PriceRequestT) => {
    const time = l1Request.time.toString();
    if (timeToThread[time]) requestsToThread[time] = timeToThread[time];
    else requestsToThread[time] = "";
  });

  // For each request that has an associated thread construct a discord thread
  // fetch to get that threads messages. Push these into an array of promises
  // so that we can fetch them all in one go.
  const promises = [];
  for (const time in requestsToThread) {
    if (requestsToThread[time] !== "")
      promises.push(getDiscordMessages(requestsToThread[time]));
    else promises.push(null);
  }
  const threadMessages = await Promise.all(promises);

  // Finally, process the results by traversing each request and the associated
  // thread to construct the final data structure with minimal data.
  const processedResults: ProcessedThread[] = [];
  threadMessages.forEach((messages, index) => {
    let processedMessages: ProcessedMessage[] = [];
    if (messages)
      processedMessages = messages
        .filter((message) => message.content != "")
        .map((msg) => {
          return {
            message: msg.content,
            sender: msg.author.username,
            senderPicture: discordPhoto(msg.author.id, msg.author.avatar),
            time: msg.timestamp,
          };
        });
    processedResults.push({
      identifier: l1Requests[index].identifier,
      time: l1Requests[index].time,
      thread: processedMessages.reverse(),
    });
  });

  return processedResults;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body = request.body as { l1Requests: PriceRequestT[] };
    ["l1Requests"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw "Missing key in req body! required: l1Requests";
    });
    const discordMessages = await fetchDiscordData(body.l1Requests);
    response.status(200).send(discordMessages);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error fetching discord thread data",
      error: e instanceof Error ? e.message : e,
    });
  }
}
