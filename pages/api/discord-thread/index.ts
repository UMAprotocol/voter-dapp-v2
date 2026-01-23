import { NextApiRequest, NextApiResponse } from "next";
import { VoteDiscussionT, L1Request } from "types";
import * as ss from "superstruct";
import { stripInvalidCharacters } from "lib/utils";
import { getCachedProcessedThread } from "./_utils";
import { makeKey } from "lib/discord-utils";

export const DiscordThreadRequestBody = ss.object({ l1Request: L1Request });
export type DiscordThreadRequestBody = ss.Infer<
  typeof DiscordThreadRequestBody
>;

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

    // Build the request key
    const requestKey = makeKey(body.l1Request.title, body.l1Request.time);

    // Fetch from Redis cache (populated by cron job)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const cachedData = await getCachedProcessedThread(requestKey);

    if (
      cachedData &&
      typeof cachedData === "object" &&
      "thread" in cachedData
    ) {
      const data = cachedData;
      console.info(
        `[discord-thread] Cache HIT for requestKey=${requestKey}, messages=${data.thread.length}`
      );
      return response
        .setHeader("Cache-Control", "public, max-age=0, s-maxage=600")
        .status(200)
        .send(data);
    }

    // No cached data - return empty thread
    console.info(
      `[discord-thread] Cache MISS for requestKey=${requestKey}, returning empty thread`
    );

    const emptyResponse: VoteDiscussionT = {
      identifier: body.l1Request.identifier,
      time: body.l1Request.time,
      thread: [],
    };

    return response
      .setHeader("Cache-Control", "public, max-age=0, s-maxage=600")
      .status(200)
      .send(emptyResponse);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error fetching discord thread data",
      error: e instanceof Error ? e.message : e,
    });
  }
}
