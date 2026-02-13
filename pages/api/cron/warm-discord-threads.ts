import { NextApiRequest, NextApiResponse } from "next";
import { VoteDiscussionT, PriceRequestT } from "types";
import { createVotingContractInstance } from "web3/contracts/createVotingContractInstance";
import { getActiveVotes, getUpcomingVotes } from "web3";
import { getVoteMetaData } from "helpers/voting/getVoteMetaData";
import { computeRoundId } from "helpers/voting/voteTiming";
import { makeKey } from "lib/discord-utils";
import {
  buildThreadIdMap,
  getCachedThreadIdMap,
  setCachedThreadIdMap,
  getDiscordMessagesPaginated,
  setCachedProcessedThread,
  shouldDoFullRebuild,
} from "../discord-thread/_utils";
import { processRawMessages } from "../discord-thread/_message-processing";

const log = (msg: string) => console.log(`[warm-discord-threads] ${msg}`);
const logError = (msg: string, err?: unknown) =>
  console.error(`[warm-discord-threads] ${msg}`, err ?? "");

interface VoteInfo {
  requestKey: string;
  identifier: string;
  time: number;
  title: string;
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
    const metadata = getVoteMetaData(
      vote.decodedIdentifier,
      vote.decodedAncillaryData,
      undefined
    );
    return {
      requestKey: makeKey(metadata.title, vote.time),
      identifier: vote.identifier,
      time: vote.time,
      title: metadata.title,
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

  const existingMap = isFullRebuild ? {} : cached?.threadIdMap ?? {};
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
    `cache updated: ${newThreadCount} ${
      isFullRebuild ? "total" : "new"
    } threads fetched, ${Object.keys(threadIdMap).length} total cached`
  );

  return { threadIdMap, isFullRebuild, cachedThreadCount, newThreadCount };
}

async function processVoteThread(
  voteInfo: VoteInfo,
  threadId: string
): Promise<number> {
  const { messages } = await getDiscordMessagesPaginated(threadId);
  const processedMessages = processRawMessages(messages);

  const voteDiscussion: VoteDiscussionT = {
    identifier: voteInfo.identifier,
    time: voteInfo.time,
    thread: processedMessages,
  };

  await setCachedProcessedThread(voteInfo.requestKey, voteDiscussion);
  return processedMessages.length;
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

    if (votes.length === 0) {
      return response.status(200).json({
        success: true,
        message: "No votes to process",
        processed: 0,
        duration: Date.now() - startTime,
      });
    }

    // Step 2: Build vote infos
    const voteInfos = buildVoteInfos(votes);

    // Step 3: Refresh thread map
    const refreshStart = Date.now();
    const { threadIdMap, isFullRebuild } = await refreshThreadIdMap();
    log(`thread map refreshed (${Date.now() - refreshStart}ms)`);

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
