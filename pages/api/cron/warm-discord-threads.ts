import { NextApiRequest, NextApiResponse } from "next";
import { VoteDiscussionT, DiscordMessageT, RawDiscordMessageT } from "types";
import { APIEmbed } from "discord-api-types/v10";
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
} from "../discord-thread/_utils";

// Message processing functions (moved from discord-thread endpoint)
function stripMarkdownHeaders(message: string): string {
  return message.replace(
    /#{1,3}\s+(.*?)$/gm,
    (_, p1: string) => `**${p1.trim()}**`
  );
}

function fixMarkdownBold(message: string): string {
  return message.replace(
    /\*\*(.*?)\*\*/g,
    (_, p1: string) => `**${p1.trim()}**`
  );
}

function discordPhoto(userId: string, userAvatar: string | null) {
  if (!userId || !userAvatar) return undefined;
  return `https://cdn.discordapp.com/avatars/${userId}/${userAvatar}`;
}

function replaceMentions(
  message: string,
  mentions: { id: string; username: string }[]
) {
  let result = message;
  for (const entry of mentions) {
    result = result.replace(`<@${entry.id}>`, `**@${entry.username}**`);
  }
  return result;
}

function replaceEmbeds(message: string, embeds: APIEmbed[]) {
  let result = message;
  for (const embed of embeds) {
    if (embed?.url && embed?.title) {
      result = result.replace(
        `(${embed.url})`,
        `[${embed.title}](${embed.url})`
      );
    }
  }
  return result;
}

function concatenateAttachments(
  message: string,
  attachments: {
    id: string;
    filename: string;
    proxy_url: string;
    url: string;
  }[]
) {
  const concat: string[] = [];
  attachments.forEach((attachment, index) => {
    concat.push(
      `[Link ${index + 1}](${attachment.url || attachment.proxy_url})`
    );
  });

  return [message, concat.join(",  ")].join("\n");
}

function processRawMessages(messages: RawDiscordMessageT[]): DiscordMessageT[] {
  // First, process all messages into a flat structure
  const allProcessedMessages: (DiscordMessageT & {
    referencedMessageId?: string;
  })[] = messages
    .filter((message) => message.content != "")
    .map((msg: RawDiscordMessageT) => {
      try {
        const sanitized = fixMarkdownBold(stripMarkdownHeaders(msg.content));
        return {
          message: concatenateAttachments(
            replaceEmbeds(
              replaceMentions(sanitized, msg.mentions || []),
              msg.embeds || []
            ),
            msg.attachments || []
          ),
          sender: msg.author?.username || "Unknown",
          senderPicture: discordPhoto(msg.author?.id, msg.author?.avatar),
          time: Math.floor(new Date(msg.timestamp).getTime() / 1000),
          id: msg.id,
          referencedMessageId: msg.message_reference?.message_id,
        };
      } catch (error) {
        console.warn("Failed to process Discord message:", error, msg);
        return null;
      }
    })
    .filter(Boolean) as (DiscordMessageT & { referencedMessageId?: string })[];

  // Create a map of all messages by ID for quick lookup
  const messageMap = new Map<
    string,
    DiscordMessageT & { referencedMessageId?: string }
  >();
  allProcessedMessages.forEach((msg) => messageMap.set(msg.id, msg));

  // Helper function to find the root parent message ID
  function findRootParentId(messageId: string): string {
    const message = messageMap.get(messageId);
    if (!message || !message.referencedMessageId) {
      return messageId;
    }
    return findRootParentId(message.referencedMessageId);
  }

  // Separate top-level messages and replies
  const topLevelMessages: DiscordMessageT[] = [];
  const repliesMap = new Map<string, DiscordMessageT[]>();
  const orphanedReplies: DiscordMessageT[] = [];

  for (const message of allProcessedMessages) {
    const { referencedMessageId, ...cleanMessage } = message;

    if (!referencedMessageId) {
      topLevelMessages.push({
        ...cleanMessage,
        replies: [],
      } as DiscordMessageT);
    } else {
      const rootParentId = findRootParentId(referencedMessageId);
      const rootParent = messageMap.get(rootParentId);
      if (rootParent && !rootParent.referencedMessageId) {
        const existingReplies = repliesMap.get(rootParentId) || [];
        existingReplies.push(cleanMessage);
        repliesMap.set(rootParentId, existingReplies);
      } else {
        orphanedReplies.push(cleanMessage);
      }
    }
  }

  // Attach replies to their parent messages
  const finalMessages = topLevelMessages.map((message) => {
    const replies = repliesMap.get(message.id) || [];
    return {
      ...message,
      replies: replies,
    };
  });

  // Add orphaned replies as top-level messages
  orphanedReplies.forEach((orphanedReply) => {
    finalMessages.push({ ...orphanedReply, replies: [] });
  });

  return finalMessages;
}

interface VoteInfo {
  requestKey: string;
  identifier: string;
  time: number;
  title: string;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const startTime = Date.now();
  console.log("[warm-discord-threads] Starting cron job...");

  try {
    // 1. Get voting contract and fetch votes
    const voting = createVotingContractInstance();
    const roundId = computeRoundId();

    console.log(`[warm-discord-threads] Current roundId: ${roundId}`);

    // Fetch active and upcoming votes in parallel
    const [activeVotesMap, upcomingVotesMap] = await Promise.all([
      getActiveVotes(voting),
      getUpcomingVotes(voting, roundId),
    ]);

    const activeVotes = Object.values(activeVotesMap);
    const upcomingVotes = Object.values(upcomingVotesMap);
    const allVotes = [...activeVotes, ...upcomingVotes];

    console.log(
      `[warm-discord-threads] Found ${activeVotes.length} active votes, ${upcomingVotes.length} upcoming votes`
    );

    if (allVotes.length === 0) {
      console.log("[warm-discord-threads] No votes to process");
      return response.status(200).json({
        success: true,
        message: "No votes to process",
        processed: 0,
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

    console.log(
      `[warm-discord-threads] Processing ${voteInfos.length} votes...`
    );

    // 3. Build/refresh thread ID map - always fetch latest threads
    const cachedThreadMapping = await getCachedThreadIdMap();
    const existingMap = cachedThreadMapping?.threadIdMap ?? {};
    const afterMessageId = cachedThreadMapping?.latestThreadId ?? undefined;

    console.log(
      `[warm-discord-threads] Cached map has ${
        Object.keys(existingMap).length
      } threads, latestMessageId=${afterMessageId ?? "none"}`
    );

    // Fetch new threads (incremental if we have a latestMessageId, full rebuild otherwise)
    const { threadIdMap: newThreads, latestMessageId } = await buildThreadIdMap(
      afterMessageId
    );

    console.log(
      `[warm-discord-threads] Fetched ${Object.keys(newThreads).length} ${
        afterMessageId ? "new" : "total"
      } threads from Discord`
    );

    // Merge: new threads override existing (in case of updates)
    const threadIdMap = { ...existingMap, ...newThreads };

    // Save the merged map to cache
    const newLatestMessageId = latestMessageId ?? afterMessageId ?? null;
    await setCachedThreadIdMap(threadIdMap, newLatestMessageId);

    console.log(
      `[warm-discord-threads] Saved merged map with ${
        Object.keys(threadIdMap).length
      } total threads, latestMessageId=${newLatestMessageId ?? "none"}`
    );

    // 4. Process each vote and store in Redis
    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const voteInfo of voteInfos) {
      try {
        const threadId = threadIdMap[voteInfo.requestKey];

        if (!threadId) {
          console.log(
            `[warm-discord-threads] No thread found for requestKey=${voteInfo.requestKey}, skipping`
          );
          skipped++;
          continue;
        }

        // Fetch messages from Discord
        const { messages } = await getDiscordMessagesPaginated(threadId);

        // Process messages
        const processedMessages = processRawMessages(messages);

        const voteDiscussion: VoteDiscussionT = {
          identifier: voteInfo.identifier,
          time: voteInfo.time,
          thread: processedMessages,
        };

        // Store in Redis
        await setCachedProcessedThread(voteInfo.requestKey, voteDiscussion);

        console.log(
          `[warm-discord-threads] Processed requestKey=${voteInfo.requestKey}, messages=${processedMessages.length}`
        );
        processed++;
      } catch (error) {
        const errorMsg = `Failed to process ${voteInfo.requestKey}: ${
          error instanceof Error ? error.message : String(error)
        }`;
        console.error(`[warm-discord-threads] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[warm-discord-threads] Completed: processed=${processed}, skipped=${skipped}, errors=${errors.length}, duration=${duration}ms`
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
    console.error("[warm-discord-threads] Cron job failed:", error);
    return response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    });
  }
}
