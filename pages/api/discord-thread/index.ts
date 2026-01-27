import { NextApiRequest, NextApiResponse } from "next";
import { VoteDiscussionT, L1Request } from "types";
import * as ss from "superstruct";
import { stripInvalidCharacters } from "lib/utils";
import { getCachedProcessedThread } from "./_utils";
import { makeKey } from "lib/discord-utils";
import { validateQueryParams } from "../_utils/validation";

export const DiscordThreadRequestBody = L1Request;
export type DiscordThreadRequestBody = ss.Infer<
  typeof DiscordThreadRequestBody
>;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { time, title, identifier } = validateQueryParams(
      request.query,
      DiscordThreadRequestBody
    );

    const titleSanitized = stripInvalidCharacters(title);

    // Build the request key
    const requestKey = makeKey(titleSanitized, time);

    // Fetch from Redis cache (populated by cron job)
    const cachedData = await getCachedProcessedThread(requestKey);

    if (cachedData) {
      console.info(
        `[discord-thread] Cache HIT for requestKey=${requestKey}, messages=${cachedData.thread.length}`
      );
      return response
        .setHeader("Cache-Control", "public, max-age=0, s-maxage=600")
        .status(200)
        .send(cachedData);
    }

    // No cached data - return empty thread
    console.info(
      `[discord-thread] Cache MISS for requestKey=${requestKey}, returning empty thread`
    );

    const emptyResponse: VoteDiscussionT = {
      identifier,
      time,
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
