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
    //
    // The threadIdMap read is an optimization for finding a live-fetch target,
    // so a Redis read or validation failure is treated as a soft miss (empty
    // thread) rather than letting it 500 the whole request — that would block
    // uncached past-vote views entirely on transient Redis issues. We still
    // mark it as a transient failure so the empty response isn't CDN-cached.
    let threadIdMapCache: Awaited<ReturnType<typeof getCachedThreadIdMap>> =
      null;
    let transientFailure = false;
    try {
      threadIdMapCache = await getCachedThreadIdMap();
    } catch (mapReadError) {
      transientFailure = true;
      console.error(
        `[discord-thread] threadIdMap read failed for requestKey=${requestKey}, treating as cache miss`,
        mapReadError
      );
    }

    // An absent map cache (cold Redis before the cron's first rebuild) is also
    // transient: a permanent CDN cache of empty would mask the thread once the
    // cron repopulates moments later.
    if (!threadIdMapCache) {
      transientFailure = true;
    }

    const threadId = threadIdMapCache?.threadIdMap?.[requestKey];

    if (threadId) {
      try {
        console.info(
          `[discord-thread] Cache MISS for requestKey=${requestKey}, live-fetching threadId=${threadId}`
        );
        const { voteDiscussion } = await fetchAndCacheProcessedThread(
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
        // Fall through to empty response so the UI can still render, but mark
        // the failure so we don't let the CDN cache the empty result.
        transientFailure = true;
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

    // On transient failure (Redis read error or Discord fetch error), don't let
    // the CDN cache the empty response — the next request should get a fresh
    // attempt instead of being served stale empty for 10 minutes. When there's
    // genuinely no threadId in the map (vote predates lookback or has no
    // discussion), caching empty is fine.
    const emptyCacheControl = transientFailure
      ? "no-store"
      : "public, max-age=0, s-maxage=600";

    return response
      .setHeader("Cache-Control", emptyCacheControl)
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
