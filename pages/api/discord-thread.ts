import { NextApiRequest, NextApiResponse } from "next";

import { PriceRequestT } from "types";

const evidenceRationalChannelId = "964000735073284127";

export async function discordRequest(
  endpoint: string,
  options: any = { method: "GET" }
) {
  const url = "https://discord.com/api/v10/" + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
    ...options,
  });

  return await res.json();
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
  const threadMsg = await getDiscordMessages(evidenceRationalChannelId);

  // Then, extract the timestamp from each message and for each timestamp relate
  // it to the associated threadId.
  let timeToThread: { [key: string]: string } = {};
  threadMsg.forEach((message: any) => {
    const time = extractValidateTimestamp(message.content);
    if (time) timeToThread[time.toString()] = message.thread.id;
  });

  // Associate the threadId with each timestamp provided in the payload.
  let requestsToThread: { [key: string]: string } = {};
  l1Requests.forEach((l1Request: PriceRequestT) => {
    const time = l1Request.time.toString();
    if (timeToThread[time]) requestsToThread[time] = timeToThread[time];
    else requestsToThread[time] = "";
  });

  // For each request that has an associated thread construct a discord thread
  // fetch to get that threads messages. Push these into an array of promises
  // so that we can fetch them all in one go.
  let promises = [];
  for (const time in requestsToThread) {
    if (requestsToThread[time] !== "")
      promises.push(getDiscordMessages(requestsToThread[time]));
    else promises.push(null);
  }
  const threadMessages = await Promise.all(promises);

  // Finally, process the results by traversing each request and the associated
  // thread to construct the final data structure with minimal data.
  let processedResults: {
    identifier: string;
    time: number;
    thread: {
      message: string;
      sender: string;
      senderPicture: string;
      time: string;
    }[];
  }[] = [];
  threadMessages.forEach((thread: any, index: number) => {
    let processedThread = [];
    if (thread)
      processedThread = thread
        .filter((message: any) => message.content != "")
        .map((msg: any) => {
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
      thread: processedThread.reverse(),
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
      message: "Error in generating multiCall tx",
      error: e instanceof Error ? e.message : e,
    });
  }
}
