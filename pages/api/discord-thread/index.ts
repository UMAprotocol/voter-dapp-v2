import { NextApiRequest, NextApiResponse } from "next";
import { VoteDiscussionT, L1Request } from "types";
import * as ss from "superstruct";
import {
  fetchAndCacheProcessedThread,
  getCachedProcessedThread,
  getCachedThreadIdMap,
} from "./_utils";
import { makeKey } from "lib/discord-utils";
import { validateQueryParams } from "../_utils/validation";
import { resolveDiscordThreadTitle } from "helpers/voting/getVoteMetaData";

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

    const effectiveTitle = resolveDiscordThreadTitle(title, identifier);
    const requestKey = makeKey(effectiveTitle, time);

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

    // Cache MISS. The warm-discord-threads cron only processes active and
    // upcoming votes, so past votes never have entries pre-warmed. Fall back to
    // looking up the threadId from the cached threadIdMap and fetching from
    // Discord on demand. The fetched data is written back to the cache so
    // subsequent reads are fast.
    const threadIdMapCache = await getCachedThreadIdMap();
    const threadId = threadIdMapCache?.threadIdMap?.[requestKey];

    if (threadId) {
      try {
        console.info(
          `[discord-thread] Cache MISS for requestKey=${requestKey}, live-fetching threadId=${threadId}`
        );
        const voteDiscussion = await fetchAndCacheProcessedThread(
          threadId,
          identifier,
          time,
          requestKey
        );
        return response
          .setHeader("Cache-Control", "public, max-age=0, s-maxage=600")
          .status(200)
          .send(voteDiscussion);
      } catch (fetchError) {
        // Fall through to empty response so the UI can still render.
        console.error(
          `[discord-thread] Live fetch failed for requestKey=${requestKey}`,
          fetchError
        );
      }
    } else {
      console.info(
        `[discord-thread] Cache MISS for requestKey=${requestKey}, no threadId in map, returning empty thread`
      );
    }

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
