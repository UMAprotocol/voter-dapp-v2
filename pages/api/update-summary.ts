import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import OpenAI from "openai";
import { createHash } from "crypto";
import * as ss from "superstruct";
import {
  OutcomeData,
  StructuredSummary,
  OpenAIJsonResponse,
} from "types/summary";
import { isDiscordSummaryDisabled } from "helpers/disabledSummaries";
import { validateQueryParams } from "./_utils/validation";
import { handleApiError, HttpError } from "./_utils/errors";
import { getBaseUrl } from "helpers/util/http";

// Default maximum interval between summary updates (10 minutes in milliseconds)
const DEFAULT_MAX_UPDATE_INTERVAL = 10 * 60 * 1000;

interface DiscordMessage {
  message: string;
  sender: string;
  senderPicture?: string;
  time: number;
  id: string;
  replies?: DiscordMessage[];
}

interface UMAApiResponse {
  identifier: string;
  time: number;
  thread: DiscordMessage[];
}

// Summary data structures imported from types/summary.ts
// Using OutcomeData and StructuredSummary from shared types
type SummaryData = StructuredSummary & {
  Uncategorized: OutcomeData; // Make Uncategorized required for internal processing
};

// Superstruct schemas for JSON validation
const SourceSchema = ss.tuple([ss.string(), ss.number()]);

const OutcomeDataSchema = ss.union([
  ss.string(),
  ss.object({
    summary: ss.string(),
    sources: ss.array(SourceSchema),
  }),
]);

const SummaryDataSchema = ss.object({
  P1: ss.optional(OutcomeDataSchema),
  P2: ss.optional(OutcomeDataSchema),
  P3: ss.optional(OutcomeDataSchema),
  P4: ss.optional(OutcomeDataSchema),
  Uncategorized: ss.optional(OutcomeDataSchema),
});

const OpenAIJsonResponseSchema = ss.union([
  ss.object({
    summary: ss.optional(SummaryDataSchema),
    sources: ss.optional(ss.record(ss.string(), ss.array(SourceSchema))),
  }),
  SummaryDataSchema,
]);

// Interface for what OpenAI returns (JSON response)
// OpenAIJsonResponse imported from types/summary.ts

// Interface for batch processing
interface BatchResult {
  batchNumber: number;
  summary: OpenAIJsonResponse;
  commentCount: number;
  startIndex: number;
  endIndex: number;
}

interface UpdateResponse {
  updated: boolean;
  cached: boolean;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  processingTimeMs: number;
}

// Interface for tracking missing comments
interface MissingComment {
  sender: string;
  time: number;
  message: string;
}

// Simplified cache data structure
interface CacheData {
  P1: OutcomeData;
  P2: OutcomeData;
  P3: OutcomeData;
  P4: OutcomeData;
  Uncategorized: OutcomeData;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  cachedAt: string;
  summaryBatchSize: number;
  model: string;
  totalComments?: number; // Total top-level comments processed
  uniqueUsers?: number; // Number of unique users who commented
  outputSources?: number; // Number of users included in summary sources
  missingCommentDetails?: MissingComment[]; // Full details of comments from missing users (when TRACK_MISSING_SOURCES=true)
  droppedRepliesCount?: number; // Number of reply messages that were ignored
}

// Helper functions for batch processing
function splitIntoBatches(
  comments: DiscordMessage[],
  batchSize: number
): DiscordMessage[][] {
  const batches = [];
  for (let i = 0; i < comments.length; i += batchSize) {
    batches.push(comments.slice(i, i + batchSize));
  }
  return batches;
}

function formatBatchPrompt(
  systemPrompt: string,
  batchComments: DiscordMessage[],
  title: string,
  batchNumber: number,
  totalBatches: number,
  startIndex: number,
  endIndex: number
): string {
  const formattedComments = batchComments
    .map((msg) => {
      return `<Comment>
<Metadata>
Author: ${msg.sender}
Timestamp: ${msg.time}
</Metadata>
<Content>
${msg.message}
</Content>
</Comment>`;
    })
    .join("\n\n");

  return `<Description>
${title}
</Description>

<BatchInfo>
Batch ${batchNumber} of ${totalBatches} (comments ${startIndex}-${endIndex})
</BatchInfo>

${formattedComments}`;
}

function formatCondensationPrompt(
  condensationPrompt: string,
  batchResults: BatchResult[],
  title: string
): string {
  let summariesText = "";

  batchResults.forEach((batchResult, index) => {
    summariesText += `<BatchSummary>
<BatchInfo>
Batch: ${index + 1}
Comments: ${batchResult.startIndex}-${batchResult.endIndex} (${
      batchResult.commentCount
    } comments)
</BatchInfo>
<Summary>
`;

    // Extract only summary text for each outcome
    Object.entries(batchResult.summary).forEach(
      ([outcome, data]: [string, unknown]) => {
        if (
          outcome !== "sources" &&
          data &&
          typeof data === "string" &&
          data.trim()
        ) {
          summariesText += `${outcome}: ${data}\n`;
        }
      }
    );

    summariesText += `</Summary>
</BatchSummary>

`;
  });

  return `${condensationPrompt}

<MarketTitle>
${title}
</MarketTitle>

<TotalBatches>${batchResults.length}</TotalBatches>

${summariesText}`;
}

function parseResponse(
  response: string,
  aggregatedSources: Record<string, [string, number][]>
): SummaryData {
  try {
    let cleanedResponse = response.trim();

    // Remove markdown code block formatting if present
    if (cleanedResponse.startsWith("```")) {
      const firstNewline = cleanedResponse.indexOf("\n");
      if (firstNewline !== -1) {
        cleanedResponse = cleanedResponse.substring(firstNewline + 1);
      }
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.substring(
        0,
        cleanedResponse.length - 3
      );
    }
    cleanedResponse = cleanedResponse.trim();

    // Try to parse as JSON first
    try {
      const parsedJson = JSON.parse(cleanedResponse);

      // Validate the parsed JSON with superstruct
      let jsonResponse: OpenAIJsonResponse;
      try {
        jsonResponse = ss.create(parsedJson, OpenAIJsonResponseSchema);
      } catch (validationError) {
        console.error("JSON validation failed:", validationError);
        // Fall back to original parsing for backward compatibility
        jsonResponse = parsedJson as OpenAIJsonResponse;
      }

      // Handle nested summary structure
      const summaryData = jsonResponse.summary || jsonResponse;

      // Helper function to extract summary text
      const extractSummary = (data: unknown): string => {
        if (typeof data === "string") return data;
        if (data && typeof data === "object" && "summary" in data) {
          const obj = data as { summary: unknown };
          return typeof obj.summary === "string" ? obj.summary : "";
        }
        return "";
      };

      // Helper function to extract sources
      const extractSources = (data: unknown): [string, number][] => {
        if (data && typeof data === "object" && "sources" in data) {
          const obj = data as { sources: unknown };
          if (Array.isArray(obj.sources)) {
            return obj.sources as [string, number][];
          }
        }
        return [];
      };

      const outcomes: SummaryData = {
        P1: {
          summary: extractSummary(summaryData.P1),
          sources:
            extractSources(summaryData.P1).length > 0
              ? extractSources(summaryData.P1)
              : aggregatedSources.P1 || [],
        },
        P2: {
          summary: extractSummary(summaryData.P2),
          sources:
            extractSources(summaryData.P2).length > 0
              ? extractSources(summaryData.P2)
              : aggregatedSources.P2 || [],
        },
        P3: {
          summary: extractSummary(summaryData.P3),
          sources:
            extractSources(summaryData.P3).length > 0
              ? extractSources(summaryData.P3)
              : aggregatedSources.P3 || [],
        },
        P4: {
          summary: extractSummary(summaryData.P4),
          sources:
            extractSources(summaryData.P4).length > 0
              ? extractSources(summaryData.P4)
              : aggregatedSources.P4 || [],
        },
        Uncategorized: {
          summary: extractSummary(summaryData.Uncategorized),
          sources:
            extractSources(summaryData.Uncategorized).length > 0
              ? extractSources(summaryData.Uncategorized)
              : aggregatedSources.Uncategorized || [],
        },
      };

      return outcomes;
    } catch (jsonError) {
      // Fall back to markdown parsing if JSON parsing fails
      const sections = {
        P1: "",
        P2: "",
        P3: "",
        P4: "",
        Uncategorized: "",
      };

      // Split by section headers and extract content
      const sectionRegex =
        /^## (P[1-4]|Uncategorized)\s*\n([\s\S]*?)(?=^## |$)/gm;
      let match;

      while ((match = sectionRegex.exec(cleanedResponse)) !== null) {
        const sectionName = match[1] as keyof typeof sections;
        const sectionContent = match[2].trim();
        sections[sectionName] = sectionContent;
      }

      // If no sections found, put everything in Uncategorized
      if (Object.values(sections).every((s) => s === "")) {
        sections.Uncategorized = cleanedResponse;
      }

      // Create final structure
      const outcomes: SummaryData = {
        P1: { summary: sections.P1, sources: aggregatedSources.P1 || [] },
        P2: { summary: sections.P2, sources: aggregatedSources.P2 || [] },
        P3: { summary: sections.P3, sources: aggregatedSources.P3 || [] },
        P4: { summary: sections.P4, sources: aggregatedSources.P4 || [] },
        Uncategorized: {
          summary: sections.Uncategorized,
          sources: aggregatedSources.Uncategorized || [],
        },
      };

      return outcomes;
    }
  } catch (error) {
    throw new Error(
      `Failed to parse response: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Helper function to clean username/timestamp source references from summary text
function cleanSummaryText(summaryData: SummaryData): SummaryData {
  // Pattern to match username/timestamp sources but preserve URL sources
  // This matches [Source: word] or [Source: word, number] but NOT URLs
  const usernameSourcePattern =
    /\s*\[Source:\s*[a-zA-Z0-9._-]+(?:\s*,\s*\d+)?\s*\]\.?/gi;

  // Regex pattern to convert URLs to markdown links for proper rendering
  // Excludes trailing punctuation that's likely sentence punctuation rather than part of the URL
  // Note: This pattern is now inlined where used to avoid unused variable linting issue

  // Pattern to remove empty parentheses
  const emptyParenthesesPattern = /\s*\(\s*\)\.?/gi;

  // Pattern to fix malformed source references like (source.). to (source).
  const malformedSourcePattern = /\(\s*source\s*\)\s*\./gi;

  // Pattern to remove trailing parentheticals like (no URLs) in any casing, with optional spaces and trailing period
  const noUrlsEndBracketPattern = /\s*\(\s*no\s*urls\s*\)\.?/gi;

  const cleanedSummary = { ...summaryData };

  // Clean P1, P2, P3, P4 outcomes
  (["P1", "P2", "P3", "P4"] as const).forEach((outcome) => {
    if (cleanedSummary[outcome] && cleanedSummary[outcome].summary) {
      const originalSummary = cleanedSummary[outcome].summary;
      // Remove username/timestamp references and convert URLs to markdown links
      const afterUsernameClean = originalSummary.replace(
        usernameSourcePattern,
        ""
      );

      // Handle URLs and source links within parentheses
      let afterUrlConversion = afterUsernameClean;

      // First, handle content within parentheses
      afterUrlConversion = afterUrlConversion.replace(
        /\(([^)]+)\)/g,
        (match, content: string) => {
          // Check if content already has [source](url) format
          if (content.includes("[source](")) {
            // Already has [source] wrappers, just add commas between them
            // Replace spaces between consecutive [source] links with commas
            const withCommas: string = content.replace(
              /\)\s+\[source\]\(/g,
              "), [source]("
            );
            return `(${withCommas})`;
          } else if (content.includes("http")) {
            // Has raw URLs, wrap them in [source]() and add commas
            const urls: RegExpMatchArray | null = content.match(
              /(https?:\/\/[^\s<>"{}|\\^`[\]]+?)(?=[.!?;,]*(?:\s|$))/gi
            );
            if (urls && urls.length > 0) {
              const sourceLinks: string = urls
                .map((url: string) => `[source](${url})`)
                .join(", ");
              return `(${sourceLinks})`;
            }
          }
          return match;
        }
      );

      // Then handle any remaining bare URLs outside of parentheses
      // Only convert URLs that aren't already wrapped in [source]()
      afterUrlConversion = afterUrlConversion.replace(
        /(https?:\/\/[^\s<>"{}|\\^`[\]]+?)(?=[.!?;,]*(?:\s|\)|$))/gi,
        (match: string, url: string) => {
          // Check if this URL is already wrapped
          const position = afterUrlConversion.indexOf(match);
          const before = afterUrlConversion.substring(
            Math.max(0, position - 10),
            position
          );
          if (before.includes("[source](")) {
            return match; // Already wrapped, don't double-wrap
          }
          return `[source](${url})`;
        }
      );

      // Remove explicit (no URLs) markers
      const afterNoUrlsRemoval = afterUrlConversion.replace(
        noUrlsEndBracketPattern,
        ""
      );

      // Remove empty parentheses
      const afterEmptyParenthesesRemoval = afterNoUrlsRemoval.replace(
        emptyParenthesesPattern,
        ""
      );
      // Fix malformed source references
      const finalCleaned = afterEmptyParenthesesRemoval.replace(
        malformedSourcePattern,
        "(source)."
      );

      cleanedSummary[outcome] = {
        ...cleanedSummary[outcome],
        summary: finalCleaned,
      };
    }
  });

  // Clean Uncategorized outcome
  if (cleanedSummary.Uncategorized && cleanedSummary.Uncategorized.summary) {
    const originalSummary = cleanedSummary.Uncategorized.summary;
    const afterUsernameClean = originalSummary.replace(
      usernameSourcePattern,
      ""
    );

    // Handle URLs and source links within parentheses
    let afterUrlConversion = afterUsernameClean;

    // First, handle content within parentheses
    afterUrlConversion = afterUrlConversion.replace(
      /\(([^)]+)\)/g,
      (match, content: string) => {
        // Check if content already has [source](url) format
        if (content.includes("[source](")) {
          // Already has [source] wrappers, just add commas between them
          // Replace spaces between consecutive [source] links with commas
          const withCommas: string = content.replace(
            /\)\s+\[source\]\(/g,
            "), [source]("
          );
          return `(${withCommas})`;
        } else if (content.includes("http")) {
          // Has raw URLs, wrap them in [source]() and add commas
          const urls: RegExpMatchArray | null = content.match(
            /(https?:\/\/[^\s<>"{}|\\^`[\]]+?)(?=[.!?;,]*(?:\s|$))/gi
          );
          if (urls && urls.length > 0) {
            const sourceLinks: string = urls
              .map((url: string) => `[source](${url})`)
              .join(", ");
            return `(${sourceLinks})`;
          }
        }
        return match;
      }
    );

    // Then handle any remaining bare URLs outside of parentheses
    // Only convert URLs that aren't already wrapped in [source]()
    afterUrlConversion = afterUrlConversion.replace(
      /(https?:\/\/[^\s<>"{}|\\^`[\]]+?)(?=[.!?;,]*(?:\s|\)|$))/gi,
      (match: string, url: string) => {
        // Check if this URL is already wrapped
        const position = afterUrlConversion.indexOf(match);
        const before = afterUrlConversion.substring(
          Math.max(0, position - 10),
          position
        );
        if (before.includes("[source](")) {
          return match; // Already wrapped, don't double-wrap
        }
        return `[source](${url})`;
      }
    );

    // Remove explicit (no URLs) markers
    const afterNoUrlsRemoval = afterUrlConversion.replace(
      noUrlsEndBracketPattern,
      ""
    );

    // Remove empty parentheses
    const afterEmptyParenthesesRemoval = afterNoUrlsRemoval.replace(
      emptyParenthesesPattern,
      ""
    );
    // Fix malformed source references
    const finalCleaned = afterEmptyParenthesesRemoval.replace(
      malformedSourcePattern,
      "(source)."
    );

    cleanedSummary.Uncategorized = {
      ...cleanedSummary.Uncategorized,
      summary: finalCleaned,
    };
  }

  return cleanedSummary;
}

// Helper function to aggregate sources from batch results
function aggregateSourcesFromBatches(
  summaryData: SummaryData,
  batchResults: BatchResult[]
): SummaryData {
  const result = { ...summaryData };

  // Initialize aggregated sources
  const aggregatedSources: Record<string, [string, number][]> = {
    P1: [],
    P2: [],
    P3: [],
    P4: [],
    Uncategorized: [],
  };

  // Aggregate sources from all batches
  batchResults.forEach((batch) => {
    if (batch.summary.sources) {
      Object.entries(batch.summary.sources).forEach(([outcome, sources]) => {
        if (aggregatedSources[outcome] && Array.isArray(sources)) {
          aggregatedSources[outcome].push(...sources);
        }
      });
    }
  });

  // Assign aggregated sources to final summary data
  (["P1", "P2", "P3", "P4", "Uncategorized"] as const).forEach((outcome) => {
    result[outcome] = {
      ...result[outcome],
      sources: aggregatedSources[outcome] || [],
    };
  });

  return result;
}

// Helper function to deduplicate sources within each category and across categories
function deduplicateAllSources(summaryData: SummaryData): SummaryData {
  const result = { ...summaryData };
  const seenUsernames = new Set<string>();

  // Process categories in priority order: P1, P2, P3, P4, Uncategorized
  const categories = ["P1", "P2", "P3", "P4", "Uncategorized"] as const;

  categories.forEach((category) => {
    if (result[category] && result[category].sources) {
      // Deduplicate within category and remove usernames already seen in other categories
      const uniqueSources: [string, number][] = [];

      result[category].sources.forEach(([username, timestamp]) => {
        if (!seenUsernames.has(username)) {
          uniqueSources.push([username, timestamp]);
          seenUsernames.add(username);
        }
      });

      result[category] = {
        ...result[category],
        sources: uniqueSources,
      };
    }
  });

  return result;
}

// Helper function to count all replies recursively in a message thread
function countRepliesRecursively(messages: DiscordMessage[]): number {
  let count = 0;

  messages.forEach((msg) => {
    if (msg.replies && msg.replies.length > 0) {
      count += msg.replies.length;
      // Recursively count replies to replies
      count += countRepliesRecursively(msg.replies);
    }
  });

  return count;
}

// Helper function to extract unique missing users from comment details
function extractMissingUsers(
  missingCommentDetails: MissingComment[]
): string[] {
  const uniqueUsers = new Set<string>();
  missingCommentDetails.forEach((comment) => {
    uniqueUsers.add(comment.sender);
  });
  return Array.from(uniqueUsers);
}

// Helper function to extract unique commenters from original messages
function extractOriginalCommenters(
  messages: DiscordMessage[]
): Map<string, DiscordMessage[]> {
  const commenterMap = new Map<string, DiscordMessage[]>();

  messages.forEach((msg) => {
    const existingMessages = commenterMap.get(msg.sender);
    if (existingMessages) {
      existingMessages.push(msg);
    } else {
      commenterMap.set(msg.sender, [msg]);
    }
  });

  return commenterMap;
}

// Helper function to get all sources from summary data
function getAllSourcesFromSummary(summaryData: SummaryData): Set<string> {
  const allSources = new Set<string>();

  (["P1", "P2", "P3", "P4", "Uncategorized"] as const).forEach((category) => {
    if (summaryData[category] && summaryData[category].sources) {
      summaryData[category].sources.forEach(([username]) => {
        allSources.add(username);
      });
    }
  });

  return allSources;
}

// Helper function to compare and log missing sources
function trackMissingSourcesIfEnabled(
  originalCommenters: Map<string, DiscordMessage[]>,
  summaryData: SummaryData,
  trackMissingSources: boolean,
  ignoredUsernames: string[] = []
): MissingComment[] | undefined {
  if (!trackMissingSources) return undefined;

  const summarySources = getAllSourcesFromSummary(summaryData);
  const originalCount = originalCommenters.size;
  const summaryCount = summarySources.size;

  console.log(
    `[Source Tracking] Original commenters: ${originalCount}, Summary sources: ${summaryCount}`
  );
  if (ignoredUsernames.length > 0) {
    console.log(
      `[Source Tracking] Ignored users: ${ignoredUsernames.join(", ")}`
    );
  }

  if (originalCount > summaryCount) {
    const missingSources: string[] = [];
    const missingDetails: MissingComment[] = [];

    originalCommenters.forEach((messages, sender) => {
      if (!summarySources.has(sender)) {
        missingSources.push(sender);
        messages.forEach((msg) => {
          missingDetails.push({
            sender: msg.sender,
            time: msg.time,
            message: msg.message,
          });
        });
      }
    });

    console.log(
      `[Source Tracking] Missing ${missingSources.length} commenters from summary:`
    );
    console.log(
      `[Source Tracking] Missing users: ${missingSources.join(", ")}`
    );

    if (missingDetails.length > 0) {
      console.log(
        `[Source Tracking] Total ${missingDetails.length} comments from missing users:`
      );
      missingDetails.forEach((detail) => {
        console.log(
          `  - ${detail.sender} @ ${new Date(detail.time).toISOString()}: "${
            detail.message
          }"`
        );
      });
    }

    return missingDetails;
  } else if (summaryCount > originalCount) {
    console.log(
      `[Source Tracking] ⚠️ Summary has MORE sources than original (possible error)`
    );
  } else {
    console.log(`[Source Tracking] ✓ All commenters represented in summary`);
  }

  return undefined;
}

// Request validation schema
const QueryParamsSchema = ss.object({
  time: ss.string(),
  identifier: ss.string(),
  title: ss.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request query parameters
    const { time, identifier, title } = validateQueryParams(
      req.query,
      QueryParamsSchema
    );

    // Validate environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const systemPrompt = process.env.SUMMARY_PROMPT;
    const promptVersion = process.env.SUMMARY_PROMPT_VERSION;

    if (!openaiApiKey) {
      throw new HttpError({
        statusCode: 500,
        msg: "OpenAI API key not configured",
      });
    }

    if (!systemPrompt) {
      throw new HttpError({
        statusCode: 500,
        msg: "Summary prompt not configured",
      });
    }

    if (!promptVersion) {
      throw new HttpError({
        statusCode: 500,
        msg: "Summary prompt version not configured",
      });
    }

    // Add batch processing environment variable validation
    const batchSize = parseInt(process.env.SUMMARY_BATCH_SIZE || "25");
    const condensationPrompt = process.env.SUMMARY_CONDENSATION_PROMPT;
    const condensationPromptVersion =
      process.env.SUMMARY_CONDENSATION_PROMPT_VERSION;
    const model = process.env.OPENAI_MODEL || "gpt-4.1";
    const maxUpdateInterval = parseInt(
      process.env.MAX_UPDATE_INTERVAL || DEFAULT_MAX_UPDATE_INTERVAL.toString()
    );
    const trackMissingSources = process.env.TRACK_MISSING_SOURCES === "true";
    const ignoredUsernamesStr = process.env.SUMMARY_IGNORED_USERNAMES || "";
    const ignoredUsernames = ignoredUsernamesStr
      ? ignoredUsernamesStr
          .split(",")
          .map((username) => username.trim())
          .filter(Boolean)
      : [];

    if (!condensationPrompt) {
      throw new HttpError({
        statusCode: 500,
        msg: "Summary condensation prompt not configured",
      });
    }

    if (!condensationPromptVersion) {
      throw new HttpError({
        statusCode: 500,
        msg: "Summary condensation prompt version not configured",
      });
    }

    const startTime = Date.now();

    // Log request start
    console.log(
      `[Summary Update] Starting for ${identifier} at ${time} - "${title}"`
    );

    // Initialize Redis
    const redis = Redis.fromEnv();
    // Call discord-thread API to get comment data
    // Use getBaseUrl() for absolute URL (required for server-side fetch)
    const baseUrl = getBaseUrl();
    const umaUrl = new URL(`${baseUrl}/api/discord-thread`);
    umaUrl.searchParams.set("time", time);
    umaUrl.searchParams.set("identifier", identifier);
    umaUrl.searchParams.set("title", title);

    const umaResponse = await fetch(umaUrl.toString());

    if (!umaResponse.ok) {
      throw new Error(
        `UMA API returned ${umaResponse.status}: ${umaResponse.statusText}`
      );
    }

    const umaData = (await umaResponse.json()) as UMAApiResponse;

    if (!umaData.thread || !Array.isArray(umaData.thread)) {
      throw new Error(
        "Invalid response from UMA API: missing or invalid thread data"
      );
    }

    // Check if there are any comments to summarize
    if (umaData.thread.length === 0) {
      const processingTimeMs = Date.now() - startTime;
      console.log(
        `[Summary Update] No comments to summarize - ${processingTimeMs}ms`
      );
      return res.status(200).json({
        updated: false,
        cached: false,
        generatedAt: new Date().toISOString(),
        commentsHash: "empty",
        promptVersion,
        processingTimeMs,
      });
    }

    // Only use top-level comments for summary - ignore all replies
    let topLevelComments = umaData.thread; // These are already top-level from the API

    // Count all replies that will be dropped
    const droppedRepliesCount = countRepliesRecursively(topLevelComments);

    if (droppedRepliesCount > 0) {
      console.log(
        `[Summary Update] Dropping ${droppedRepliesCount} reply messages (only processing top-level comments)`
      );
    }

    // Filter out ignored usernames if configured
    if (ignoredUsernames.length > 0) {
      const beforeCount = topLevelComments.length;
      topLevelComments = topLevelComments.filter(
        (comment) => !ignoredUsernames.includes(comment.sender)
      );
      const afterCount = topLevelComments.length;

      if (beforeCount > afterCount) {
        console.log(
          `[Summary Update] Filtered out ${
            beforeCount - afterCount
          } comments from ignored users: ${ignoredUsernames.join(", ")}`
        );
      }

      // Check if all comments were filtered out
      if (afterCount === 0 && beforeCount > 0) {
        const processingTimeMs = Date.now() - startTime;
        console.log(
          `[Summary Update] All comments filtered (all from ignored users) - ${processingTimeMs}ms`
        );
        return res.status(200).json({
          updated: false,
          cached: false,
          generatedAt: new Date().toISOString(),
          commentsHash: "empty-filtered",
          promptVersion,
          processingTimeMs,
        });
      }
    }

    // Extract original commenters for tracking (after filtering)
    const originalCommenters = extractOriginalCommenters(topLevelComments);

    // Calculate how many comments are from users posting multiple times
    const duplicateCommentsCount =
      topLevelComments.length - originalCommenters.size;
    if (duplicateCommentsCount > 0) {
      console.log(
        `[Summary Update] ${topLevelComments.length} total comments from ${originalCommenters.size} unique users (${duplicateCommentsCount} additional comments from users posting multiple times)`
      );
    }

    // Update cache key logic based on comment count
    const isBatched = topLevelComments.length > batchSize;
    const promptVersionForCache = isBatched
      ? `${promptVersion}:${condensationPromptVersion}`
      : promptVersion;

    // Create standard cache key using the primary parameters only (ignore ignored-user list)
    const cacheKey = `discord-summary:${time}:${identifier}:${title}`;

    // Check if this summary is disabled
    if (isDiscordSummaryDisabled(cacheKey)) {
      throw new HttpError({
        statusCode: 403,
        msg: "Discord summary generation is disabled for this market.",
      });
    }

    // Format messages for OpenAI and compute hash (top-level comments only)
    const formattedComments = topLevelComments
      .map((msg) => {
        return `<Comment>
<Metadata>
Author: ${msg.sender}
Timestamp: ${msg.time}
</Metadata>
<Content>
${msg.message}
</Content>
</Comment>`;
      })
      .join("\n\n");

    const commentsHash = createHash("sha256")
      .update(formattedComments)
      .digest("hex");

    // Check cache first to see if we need to respect the update interval
    const cachedData = await redis.get<CacheData>(cacheKey);

    if (cachedData) {
      const timeSinceLastUpdate =
        Date.now() - new Date(cachedData.generatedAt).getTime();

      if (timeSinceLastUpdate < maxUpdateInterval) {
        // Too soon to update, return existing data without fetching comments
        const processingTimeMs = Date.now() - startTime;
        console.log(
          `[Summary Update] Cache hit (too recent) - ${processingTimeMs}ms`
        );
        // Log cached summary stats
        if (
          cachedData.totalComments !== undefined &&
          cachedData.outputSources !== undefined
        ) {
          console.log(
            `[Summary Update] Cached summary: ${
              cachedData.totalComments
            } comments, ${cachedData.uniqueUsers ?? "?"} unique users, ${
              cachedData.outputSources
            } sources`
          );
          if (
            cachedData.missingCommentDetails &&
            cachedData.missingCommentDetails.length > 0
          ) {
            const missingUsers = extractMissingUsers(
              cachedData.missingCommentDetails
            );
            console.log(
              `[Summary Update] Missing ${
                missingUsers.length
              } users: ${missingUsers.join(", ")}`
            );
            console.log(
              `[Summary Update] Total ${cachedData.missingCommentDetails.length} comments from missing users`
            );
          }
          if (cachedData.droppedRepliesCount !== undefined) {
            console.log(
              `[Summary Update] Dropped ${cachedData.droppedRepliesCount} replies`
            );
          }
        }
        const response: UpdateResponse = {
          updated: false,
          cached: true,
          generatedAt: cachedData.generatedAt,
          commentsHash: cachedData.commentsHash,
          promptVersion: cachedData.promptVersion,
          processingTimeMs,
        };
        return res.status(200).json(response);
      }
    }

    // Check if content or prompt has changed (we already passed the time check)
    if (
      cachedData &&
      cachedData.commentsHash === commentsHash &&
      cachedData.promptVersion === promptVersionForCache
    ) {
      // Return metadata if hash and prompt version match (cached)
      const processingTimeMs = Date.now() - startTime;
      console.log(
        `[Summary Update] Cache hit (unchanged) - ${processingTimeMs}ms`
      );
      // Log cached summary stats
      if (
        cachedData.totalComments !== undefined &&
        cachedData.outputSources !== undefined
      ) {
        console.log(
          `[Summary Update] Cached summary: ${
            cachedData.totalComments
          } comments, ${cachedData.uniqueUsers ?? "?"} unique users, ${
            cachedData.outputSources
          } sources`
        );
        if (
          cachedData.missingCommentDetails &&
          cachedData.missingCommentDetails.length > 0
        ) {
          const missingUsers = extractMissingUsers(
            cachedData.missingCommentDetails
          );
          console.log(
            `[Summary Update] Missing ${
              missingUsers.length
            } users: ${missingUsers.join(", ")}`
          );
        }
        if (cachedData.droppedRepliesCount !== undefined) {
          console.log(
            `[Summary Update] Dropped ${cachedData.droppedRepliesCount} replies`
          );
        }
      }
      const response: UpdateResponse = {
        updated: false,
        cached: true,
        generatedAt: cachedData.generatedAt,
        commentsHash: cachedData.commentsHash,
        promptVersion: cachedData.promptVersion,
        processingTimeMs,
      };
      return res.status(200).json(response);
    }

    // Generate new summary if cache miss, hash mismatch, or prompt version changed
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    let summaryData: SummaryData;
    let missingDetails: MissingComment[] | undefined;

    if (topLevelComments.length <= batchSize) {
      // Single-pass processing for markdown
      console.log(
        `[Summary Update] Processing ${topLevelComments.length} comments in single pass`
      );
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: formattedComments,
          },
        ],
        response_format: { type: "json_object" },
      });

      const markdownResponse = completion.choices[0]?.message?.content;

      if (!markdownResponse) {
        throw new Error("OpenAI returned empty response");
      }

      // For single-pass, parse the AI response and extract any source categorization
      summaryData = parseResponse(markdownResponse, {
        P1: [],
        P2: [],
        P3: [],
        P4: [],
        Uncategorized: [],
      });

      // Deduplicate sources for single-pass processing too
      summaryData = deduplicateAllSources(summaryData);

      // Track missing sources if enabled and collect missing comments
      missingDetails = trackMissingSourcesIfEnabled(
        originalCommenters,
        summaryData,
        trackMissingSources,
        ignoredUsernames
      );
    } else {
      // Batched processing for markdown
      const commentBatches = splitIntoBatches(topLevelComments, batchSize);
      console.log(
        `[Summary Update] Processing ${topLevelComments.length} comments in ${commentBatches.length} batches`
      );

      // Prepare all batch processing promises
      const batchPromises = commentBatches.map(async (batch, i) => {
        const batchNumber = i + 1;
        const startIndex = i * batchSize + 1;
        const endIndex = Math.min((i + 1) * batchSize, topLevelComments.length);

        const batchPromptFormatted = formatBatchPrompt(
          systemPrompt,
          batch,
          title,
          batchNumber,
          commentBatches.length,
          startIndex,
          endIndex
        );

        try {
          const batchCompletion = await openai.chat.completions.create({
            model: model,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: batchPromptFormatted,
              },
            ],
            response_format: { type: "json_object" },
          });

          const batchSummaryText = batchCompletion.choices[0]?.message?.content;

          if (!batchSummaryText) {
            throw new Error(
              `OpenAI returned empty response for batch ${batchNumber}`
            );
          }

          // Parse the batch response to get proper categorization
          try {
            const parsedBatchJson = JSON.parse(batchSummaryText);

            // Validate the parsed JSON with superstruct
            let batchParsedResponse: OpenAIJsonResponse;
            try {
              batchParsedResponse = ss.create(
                parsedBatchJson,
                OpenAIJsonResponseSchema
              );
            } catch (validationError) {
              console.error("Batch JSON validation failed:", validationError);
              // Fall back to original parsing for backward compatibility
              batchParsedResponse = parsedBatchJson as OpenAIJsonResponse;
            }

            // Helper function to extract summary text
            const extractSummary = (data: unknown): string => {
              if (typeof data === "string") return data;
              if (data && typeof data === "object" && "summary" in data) {
                const obj = data as { summary: unknown };
                return typeof obj.summary === "string" ? obj.summary : "";
              }
              return "";
            };

            // Helper function to extract sources from nested structure
            const extractBatchSources = (data: unknown): [string, number][] => {
              if (data && typeof data === "object" && "sources" in data) {
                const obj = data as { sources: unknown };
                if (Array.isArray(obj.sources)) {
                  // Validate each source is a [string, number] tuple
                  return obj.sources.filter(
                    (source): source is [string, number] =>
                      Array.isArray(source) &&
                      source.length === 2 &&
                      typeof source[0] === "string" &&
                      typeof source[1] === "number"
                  );
                }
              }
              return [];
            };

            // Handle nested summary structure for condensation
            const summaryData =
              batchParsedResponse.summary || batchParsedResponse;

            // Extract sources from each outcome in the nested structure
            const extractedSources = {
              P1: extractBatchSources(summaryData.P1),
              P2: extractBatchSources(summaryData.P2),
              P3: extractBatchSources(summaryData.P3),
              P4: extractBatchSources(summaryData.P4),
              Uncategorized: extractBatchSources(summaryData.Uncategorized),
            };

            return {
              batchNumber,
              summary: {
                P1: extractSummary(summaryData.P1),
                P2: extractSummary(summaryData.P2),
                P3: extractSummary(summaryData.P3),
                P4: extractSummary(summaryData.P4),
                Uncategorized: extractSummary(summaryData.Uncategorized),
                sources: extractedSources,
              },
              commentCount: batch.length,
              startIndex,
              endIndex,
            };
          } catch (error) {
            // If JSON parsing fails, fallback to putting everything in Uncategorized
            // BUT preserve empty sources structure to avoid losing track of this batch

            return {
              batchNumber,
              summary: {
                P1: "",
                P2: "",
                P3: "",
                P4: "",
                Uncategorized: batchSummaryText,
                // Include empty sources to maintain structure consistency
                sources: {
                  P1: [],
                  P2: [],
                  P3: [],
                  P4: [],
                  Uncategorized: [],
                },
              },
              commentCount: batch.length,
              startIndex,
              endIndex,
            };
          }
        } catch (error) {
          throw new Error(
            `Failed to process batch ${batchNumber}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      });

      // Execute all batch processing in parallel
      const batchResults = await Promise.all(batchPromises);

      // Validate that all batches have sources structure
      batchResults.forEach((batch) => {
        if (!batch.summary.sources) {
          // Ensure sources structure exists even if empty
          batch.summary.sources = {
            P1: [],
            P2: [],
            P3: [],
            P4: [],
            Uncategorized: [],
          };
        }
      });

      // Condense batch results

      const condensationPromptFormatted = formatCondensationPrompt(
        condensationPrompt,
        batchResults,
        title
      );

      const condensationCompletion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: condensationPromptFormatted,
          },
        ],
        response_format: { type: "json_object" },
      });

      const condensedSummaryText =
        condensationCompletion.choices[0]?.message?.content;

      if (!condensedSummaryText) {
        throw new Error("OpenAI returned empty condensation response");
      }

      // Parse the condensed response first
      summaryData = parseResponse(condensedSummaryText, {
        P1: [],
        P2: [],
        P3: [],
        P4: [],
        Uncategorized: [],
      });

      // Aggregate sources from all batch results
      summaryData = aggregateSourcesFromBatches(summaryData, batchResults);
    }

    // Deduplicate sources to ensure no commenter appears multiple times
    summaryData = deduplicateAllSources(summaryData);

    // Track missing sources if enabled and collect missing comments
    missingDetails = trackMissingSourcesIfEnabled(
      originalCommenters,
      summaryData,
      trackMissingSources,
      ignoredUsernames
    );

    // Clean placeholder source links from the summary data
    const cleanedSummaryData = cleanSummaryText(summaryData);

    // Calculate total sources for cache
    const totalSourcesForCache =
      cleanedSummaryData.P1.sources.length +
      cleanedSummaryData.P2.sources.length +
      cleanedSummaryData.P3.sources.length +
      cleanedSummaryData.P4.sources.length +
      cleanedSummaryData.Uncategorized.sources.length;

    // Create cache data (simplified structure with P1/P2/P3/P4 at top level)
    const now = new Date().toISOString();
    const cacheData: CacheData = {
      P1: cleanedSummaryData.P1,
      P2: cleanedSummaryData.P2,
      P3: cleanedSummaryData.P3,
      P4: cleanedSummaryData.P4,
      Uncategorized: cleanedSummaryData.Uncategorized,
      generatedAt: now,
      commentsHash,
      promptVersion: promptVersionForCache,
      cachedAt: now,
      summaryBatchSize: isBatched ? batchSize : 0,
      model,
      totalComments: topLevelComments.length,
      uniqueUsers: originalCommenters.size,
      outputSources: totalSourcesForCache,
      ...(missingDetails && { missingCommentDetails: missingDetails }), // Include full comment details if tracking enabled
      droppedRepliesCount,
    };

    // Store in Redis permanently
    await redis.set(cacheKey, cacheData);

    // Return update metadata
    const processingTimeMs = Date.now() - startTime;

    // Log summary statistics
    console.log(`[Summary Update] Complete - Generated new summary:`);
    console.log(`  • Total comments: ${cacheData.totalComments ?? "?"}`);
    console.log(`  • Unique users: ${cacheData.uniqueUsers ?? "?"}`);
    console.log(`  • Output sources: ${cacheData.outputSources ?? "?"}`);
    if (missingDetails && missingDetails.length > 0) {
      const missingUsers = extractMissingUsers(missingDetails);
      console.log(
        `  • Missing users: ${missingUsers.length} (${missingUsers.join(", ")})`
      );
      console.log(
        `  • Total comments from missing users: ${missingDetails.length}`
      );
    }
    const duplicateComments = topLevelComments.length - originalCommenters.size;
    if (duplicateComments > 0) {
      console.log(
        `  • Duplicate comments: ${duplicateComments} (from users posting multiple times)`
      );
    }
    console.log(`  • Dropped replies: ${droppedRepliesCount}`);
    console.log(`  • Processing: ${processingTimeMs}ms`);
    console.log(`  • Batched: ${String(isBatched)}`);

    const response: UpdateResponse = {
      updated: true,
      cached: false,
      generatedAt: now,
      commentsHash,
      promptVersion: promptVersionForCache,
      processingTimeMs,
    };

    res.status(200).json(response);
  } catch (error) {
    return handleApiError(error, res);
  }
}
