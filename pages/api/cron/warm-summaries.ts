import { NextApiRequest, NextApiResponse } from "next";
import { createVotingContractInstance } from "web3/contracts/createVotingContractInstance";
import { getActiveVotes, getUpcomingVotes } from "web3";
import { getVoteMetaData } from "helpers/voting/getVoteMetaData";
import { computeRoundId } from "helpers/voting/voteTiming";
import { makeKey } from "lib/discord-utils";
import { getCachedProcessedThread } from "../discord-thread/_utils";
import { getBaseUrl } from "helpers/util/http";

interface VoteInfo {
  requestKey: string;
  identifier: string;
  time: number;
  title: string;
}

interface UpdateSummaryResponse {
  updated: boolean;
  cached: boolean;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  processingTimeMs: number;
}

interface WarmSummariesResponse {
  success: boolean;
  processed: number;
  skipped: number;
  errors: number;
  total: number;
  duration: number;
  errorDetails?: string[];
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<WarmSummariesResponse | { error: string }>
) {
  const startTime = Date.now();
  console.log("[warm-summaries] Starting cron job...");

  try {
    // 1. Get voting contract and fetch votes (same approach as warm-discord-threads)
    const voting = createVotingContractInstance();
    const roundId = computeRoundId();

    console.log(`[warm-summaries] Current roundId: ${roundId}`);

    // Fetch active and upcoming votes in parallel
    const [activeVotesMap, upcomingVotesMap] = await Promise.all([
      getActiveVotes(voting),
      getUpcomingVotes(voting, roundId),
    ]);

    const activeVotes = Object.values(activeVotesMap);
    const upcomingVotes = Object.values(upcomingVotesMap);
    const allVotes = [...activeVotes, ...upcomingVotes];

    console.log(
      `[warm-summaries] Found ${activeVotes.length} active votes, ${upcomingVotes.length} upcoming votes`
    );

    if (allVotes.length === 0) {
      console.log("[warm-summaries] No votes to process");
      return response.status(200).json({
        success: true,
        processed: 0,
        skipped: 0,
        errors: 0,
        total: 0,
        duration: Date.now() - startTime,
      });
    }

    // 2. Build vote info with titles
    const voteInfos: VoteInfo[] = allVotes.map((vote) => {
      const metadata = getVoteMetaData(
        vote.decodedIdentifier,
        vote.decodedAncillaryData,
        undefined // contentful data not available in cron context
      );
      const requestKey = makeKey(metadata.title, vote.time);
      return {
        requestKey,
        identifier: vote.identifier,
        time: vote.time,
        title: metadata.title,
      };
    });

    console.log(`[warm-summaries] Processing ${voteInfos.length} votes...`);

    // 3. Process each vote - read from cache and call update-summary if data exists
    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];

    const baseUrl = getBaseUrl();

    for (const voteInfo of voteInfos) {
      try {
        // Read directly from the same cache that warm-discord-threads populates
        const cachedThread = await getCachedProcessedThread(
          voteInfo.requestKey
        );

        if (
          !cachedThread ||
          !cachedThread.thread ||
          cachedThread.thread.length === 0
        ) {
          console.log(
            `[warm-summaries] No cached thread data for requestKey=${voteInfo.requestKey}, skipping`
          );
          skipped++;
          continue;
        }

        console.log(
          `[warm-summaries] Found cached thread for requestKey=${voteInfo.requestKey}, messages=${cachedThread.thread.length}`
        );

        // Call update-summary endpoint with absolute URL
        const updateUrl = new URL(`${baseUrl}/api/update-summary`);
        updateUrl.searchParams.set("time", voteInfo.time.toString());
        updateUrl.searchParams.set("identifier", voteInfo.identifier);
        updateUrl.searchParams.set("title", voteInfo.title);

        const updateResponse = await fetch(updateUrl.toString());

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`HTTP ${updateResponse.status}: ${errorText}`);
        }

        const result = (await updateResponse.json()) as UpdateSummaryResponse;
        console.log(
          `[warm-summaries] Updated summary for requestKey=${
            voteInfo.requestKey
          }, updated=${String(result.updated)}, cached=${String(result.cached)}`
        );
        processed++;
      } catch (error) {
        const errorMsg = `Failed to process ${voteInfo.requestKey}: ${
          error instanceof Error ? error.message : String(error)
        }`;
        console.error(`[warm-summaries] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[warm-summaries] Completed: processed=${processed}, skipped=${skipped}, errors=${errors.length}, duration=${duration}ms`
    );

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
    console.error("[warm-summaries] Cron job failed:", error);
    return response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    });
  }
}
