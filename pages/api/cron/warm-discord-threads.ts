import { NextApiRequest, NextApiResponse } from "next";
import { PriceRequestT } from "types";
import { createVotingContractInstance } from "web3/contracts/createVotingContractInstance";
import { getActiveVotes, getUpcomingVotes } from "web3";
import {
  getVoteMetaData,
  resolveDiscordThreadTitle,
} from "helpers/voting/getVoteMetaData";
import { computeRoundId } from "helpers/voting/voteTiming";
import { makeKey } from "lib/discord-utils";
import {
  buildThreadIdMap,
  getCachedThreadIdMap,
  setCachedThreadIdMap,
  fetchAndCacheProcessedThread,
  shouldDoFullRebuild,
} from "../discord-thread/_utils";

const log = (msg: string) => console.log(`[warm-discord-threads] ${msg}`);
const logError = (msg: string, err?: unknown) =>
  console.error(`[warm-discord-threads] ${msg}`, err ?? "");

interface VoteInfo {
  requestKey: string;
  identifier: string;
  time: number;
}

interface ThreadMapRefreshResult {
  threadIdMap: Record<string, string>;
  isFullRebuild: boolean;
  cachedThreadCount: number;
  newThreadCount: number;
}

interface ProcessingResult {
  processed: number;
  skipped: number;
  errors: string[];
}

async function fetchAllVotes(): Promise<PriceRequestT[]> {
  const voting = createVotingContractInstance();
  const roundId = computeRoundId();

  const [activeVotesMap, upcomingVotesMap] = await Promise.all([
    getActiveVotes(voting),
    getUpcomingVotes(voting, roundId),
  ]);

  return [...Object.values(activeVotesMap), ...Object.values(upcomingVotesMap)];
}

function buildVoteInfos(votes: PriceRequestT[]): VoteInfo[] {
  return votes.map((vote) => {
    const { title } = getVoteMetaData(
      vote.decodedIdentifier,
      vote.decodedAncillaryData,
      undefined
    );
    const discordTitle = resolveDiscordThreadTitle(
      title,
      vote.decodedIdentifier
    );
    return {
      requestKey: makeKey(discordTitle, vote.time),
      identifier: vote.identifier,
      time: vote.time,
    };
  });
}

async function refreshThreadIdMap(): Promise<ThreadMapRefreshResult> {
  const cached = await getCachedThreadIdMap();
  const isFullRebuild = shouldDoFullRebuild(cached);
  const cachedThreadCount = Object.keys(cached?.threadIdMap ?? {}).length;

  // Log cache state
  if (cached?.lastFullRebuildAt) {
    const ageMinutes = Math.round(
      (Date.now() - cached.lastFullRebuildAt) / 60000
    );
    log(
      `cache: ${cachedThreadCount} threads, ${ageMinutes}m old` +
        (isFullRebuild ? " (stale, rebuilding)" : "")
    );
  } else {
    log("cache: empty, doing full rebuild");
  }

  // Preserve previously cached entries across full rebuilds so that past votes
  // whose threads are older than the rebuild lookback window remain resolvable
  // by the discord-thread endpoint's cache-miss fallback. The full rebuild still
  // refetches the lookback window from scratch to catch threads missed by
  // incremental updates; we just merge those into the existing map instead of
  // replacing it.
  const existingMap = cached?.threadIdMap ?? {};
  const afterMessageId = isFullRebuild
    ? undefined
    : cached?.latestThreadId ?? undefined;

  const { threadIdMap: newThreads, latestMessageId } = await buildThreadIdMap(
    afterMessageId
  );

  const newThreadCount = Object.keys(newThreads).length;
  const threadIdMap = { ...existingMap, ...newThreads };

  await setCachedThreadIdMap(
    threadIdMap,
    latestMessageId ?? afterMessageId ?? null,
    isFullRebuild ? Date.now() : cached?.lastFullRebuildAt
  );

  log(
    `cache updated: ${newThreadCount} threads fetched (${
      isFullRebuild ? "lookback rebuild" : "incremental"
    }), ${Object.keys(threadIdMap).length} total cached`
  );

  return { threadIdMap, isFullRebuild, cachedThreadCount, newThreadCount };
}

async function processVoteThread(
  voteInfo: VoteInfo,
  threadId: string
): Promise<number> {
  const { voteDiscussion, cacheWriteError } =
    await fetchAndCacheProcessedThread(
      threadId,
      voteInfo.identifier,
      voteInfo.time,
      voteInfo.requestKey
    );
  // The helper swallows cache write failures so the discord-thread endpoint can
  // still serve fresh data on a Redis blip. In the cron, an unwritten cache
  // means warm-summaries won't see this vote, so surface it as a per-vote
  // error to keep monitoring honest.
  if (cacheWriteError) {
    throw cacheWriteError instanceof Error
      ? cacheWriteError
      : new Error(String(cacheWriteError));
  }
  return voteDiscussion.thread.length;
}

async function processAllVotes(
  voteInfos: VoteInfo[],
  threadIdMap: Record<string, string>
): Promise<ProcessingResult> {
  const result: ProcessingResult = { processed: 0, skipped: 0, errors: [] };
  const skippedKeys: string[] = [];

  for (const voteInfo of voteInfos) {
    const threadId = threadIdMap[voteInfo.requestKey];

    if (!threadId) {
      result.skipped++;
      skippedKeys.push(voteInfo.requestKey);
      continue;
    }

    try {
      await processVoteThread(voteInfo, threadId);
      result.processed++;
    } catch (error) {
      result.errors.push(
        `${voteInfo.requestKey}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  if (skippedKeys.length > 0) {
    log(`no thread found for: ${skippedKeys.join(", ")}`);
  }

  return result;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const startTime = Date.now();
  log("starting");

  try {
    // Step 1: Fetch votes
    const votesStart = Date.now();
    const votes = await fetchAllVotes();
    log(`fetched ${votes.length} votes (${Date.now() - votesStart}ms)`);

    // Step 2: Refresh thread map — done unconditionally so the discord-thread
    // endpoint's past-vote fallback can resolve threads even during quiet
    // periods with zero active/upcoming votes, including after a Redis reset.
    const refreshStart = Date.now();
    const { threadIdMap, isFullRebuild } = await refreshThreadIdMap();
    log(`thread map refreshed (${Date.now() - refreshStart}ms)`);

    if (votes.length === 0) {
      return response.status(200).json({
        success: true,
        message: "No votes to process",
        processed: 0,
        isFullRebuild,
        duration: Date.now() - startTime,
      });
    }

    // Step 3: Build vote infos
    const voteInfos = buildVoteInfos(votes);

    // Step 4: Process votes
    const processStart = Date.now();
    const { processed, skipped, errors } = await processAllVotes(
      voteInfos,
      threadIdMap
    );
    log(`processed ${processed} threads (${Date.now() - processStart}ms)`);

    // Summary
    const duration = Date.now() - startTime;
    log(
      `done: ${isFullRebuild ? "full rebuild" : "incremental"}, ` +
        `${processed} processed, ${skipped} skipped, ${errors.length} errors (${duration}ms total)`
    );

    if (errors.length > 0) {
      logError("errors:", errors);
    }

    return response.status(200).json({
      success: true,
      processed,
      skipped,
      errors: errors.length,
      total: voteInfos.length,
      duration,
      errorDetails: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("failed:", error);
    return response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    });
  }
}
