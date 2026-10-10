import { NextApiRequest, NextApiResponse } from "next";
import { VoteDiscussionT, L1Request } from "types";
import * as ss from "superstruct";
import {
  buildThreadIdMap,
  getCachedProcessedThread,
  getCachedThreadIdMap,
} from "./_utils";
import { makeKey } from "lib/discord-utils";
import { validateQueryParams } from "../_utils/validation";
import {
  MISSING_DISCORD_TITLE_FALLBACK,
  resolveDiscordThreadTitle,
} from "helpers/voting/getVoteMetaData";

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
    let threadId = cachedData?.threadId;

    // Older processed caches do not contain IDs. Thread names remain readable
    // when Discord withholds message content, so the map can still supply a link.
    if (!threadId && effectiveTitle !== MISSING_DISCORD_TITLE_FALLBACK) {
      try {
        const localMetadataOnly =
          process.env.NODE_ENV === "development" &&
          process.env.DISABLE_REDIS === "true";
        const mapping = localMetadataOnly
          ? await buildThreadIdMap()
          : await getCachedThreadIdMap();
        const candidates = mapping?.threadIdMap[requestKey] ?? [];
        if (candidates.length === 1 && /^\d{17,20}$/.test(candidates[0])) {
          threadId = candidates[0];
        }
      } catch (error) {
        // A missing link must not prevent serving the cached discussion.
        console.warn("[discord-thread] Thread link lookup failed", error);
      }
    }

    if (cachedData) {
      console.info(
        `[discord-thread] Cache HIT for requestKey=${requestKey}, messages=${cachedData.thread.length}`
      );
      return response
        .setHeader("Cache-Control", "public, max-age=0, s-maxage=600")
        .status(200)
        .send({ ...cachedData, threadId });
    }

    // No cached data - return empty thread
    console.info(
      `[discord-thread] Cache MISS for requestKey=${requestKey}, returning empty thread`
    );

    const emptyResponse: VoteDiscussionT = {
      identifier,
      time,
      thread: [],
      threadId,
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
