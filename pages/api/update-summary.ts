import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import OpenAI from "openai";
import { createHash } from "crypto";

// Maximum interval between summary updates (5 minutes in milliseconds)
const MAX_UPDATE_INTERVAL = 5 * 60 * 1000;

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

interface OutcomeData {
  description: string;
  summary: string;
  sources: [string, number][];
}

interface UncategorizedData {
  summary: string;
  sources: [string, number][];
}

interface StructuredSummary {
  P1: OutcomeData;
  P2: OutcomeData;
  P3: OutcomeData;
  P4: OutcomeData;
  Uncategorized: UncategorizedData;
}

// Interface for what OpenAI actually returns (which includes metadata)
interface OpenAIResponse {
  summary: StructuredSummary;
  generatedAt?: string;
  commentsHash?: string;
  promptVersion?: string;
}

// Interface for batch processing
interface BatchResult {
  batchNumber: number;
  summary: StructuredSummary;
  commentCount: number;
  startIndex: number;
  endIndex: number;
}

// Interface for parsed JSON data from OpenAI condensation
interface ParsedCondensationData {
  summary: StructuredSummary;
}

interface UpdateResponse {
  updated: boolean;
  cached: boolean;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  processingTimeMs: number;
}

// Change this to be simpler and avoid nesting issues
interface CacheData {
  P1: OutcomeData;
  P2: OutcomeData;
  P3: OutcomeData;
  P4: OutcomeData;
  Uncategorized: UncategorizedData;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  cachedAt: string;
  summaryBatchSize: number;
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
      ([outcome, data]: [string, OutcomeData | UncategorizedData]) => {
        if (data.summary && data.summary.trim()) {
          summariesText += `${outcome}: ${data.summary}\n`;
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

function aggregateSources(
  batchResults: BatchResult[]
): Record<string, [string, number][]> {
  const userAppearances: Record<
    string,
    Array<{ outcome: string; timestamp: number }>
  > = {};

  // Collect all user appearances across all batches
  batchResults.forEach((batch) => {
    Object.entries(batch.summary).forEach(
      ([outcome, data]: [string, OutcomeData | UncategorizedData]) => {
        if (data.sources && Array.isArray(data.sources)) {
          data.sources.forEach(([username, timestamp]: [string, number]) => {
            if (!userAppearances[username]) {
              userAppearances[username] = [];
            }
            userAppearances[username].push({ outcome, timestamp });
          });
        }
      }
    );
  });

  // Place each user in their most recent outcome only
  const aggregated: Record<string, [string, number][]> = {
    P1: [],
    P2: [],
    P3: [],
    P4: [],
    Uncategorized: [],
  };

  Object.entries(userAppearances).forEach(([username, appearances]) => {
    const mostRecent = appearances.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );
    aggregated[mostRecent.outcome].push([username, mostRecent.timestamp]);
  });

  // Sort by timestamp (newest first) for each outcome
  Object.keys(aggregated).forEach((outcome) => {
    aggregated[outcome].sort((a, b) => b[1] - a[1]);
  });

  return aggregated;
}

function injectSourcesIntoSummary(
  condensedSummary: string,
  aggregatedSources: Record<string, [string, number][]>
): StructuredSummary {
  try {
    let cleanedSummary = condensedSummary.trim();

    // Remove markdown code block formatting if present
    if (cleanedSummary.startsWith("```json")) {
      cleanedSummary = cleanedSummary.substring(7);
    } else if (cleanedSummary.startsWith("```")) {
      cleanedSummary = cleanedSummary.substring(3);
    }
    if (cleanedSummary.endsWith("```")) {
      cleanedSummary = cleanedSummary.substring(0, cleanedSummary.length - 3);
    }
    cleanedSummary = cleanedSummary.trim();

    const data = JSON.parse(cleanedSummary) as ParsedCondensationData;

    // Ensure structure exists
    if (!data.summary) {
      data.summary = {
        P1: { description: "", summary: "", sources: [] },
        P2: { description: "", summary: "", sources: [] },
        P3: { description: "", summary: "", sources: [] },
        P4: { description: "", summary: "", sources: [] },
        Uncategorized: { summary: "", sources: [] },
      };
    }

    // Inject sources into each outcome
    (["P1", "P2", "P3", "P4", "Uncategorized"] as const).forEach((outcome) => {
      if (!data.summary[outcome]) {
        if (outcome === "Uncategorized") {
          data.summary[outcome] = { summary: "", sources: [] };
        } else {
          data.summary[outcome] = {
            description: "",
            summary: "",
            sources: [],
          };
        }
      }
      data.summary[outcome].sources = aggregatedSources[outcome] || [];
    });

    return data.summary;
  } catch (error) {
    throw new Error(
      `Failed to inject sources: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Helper function to clean placeholder source links from summary text
function cleanSummaryText(summaryData: StructuredSummary): StructuredSummary {
  // Regex pattern to match [Source: ...] patterns that don't contain valid URLs
  // This will match [Source: anything] unless it contains http:// or https://
  const invalidSourcePattern = /\s*\[Source:\s*(?!https?:\/\/)[^\]]*\]\.?/gi;

  const cleanedSummary = { ...summaryData };

  // Clean P1, P2, P3, P4 outcomes
  (["P1", "P2", "P3", "P4"] as const).forEach((outcome) => {
    if (cleanedSummary[outcome] && cleanedSummary[outcome].summary) {
      cleanedSummary[outcome] = {
        ...cleanedSummary[outcome],
        summary: cleanedSummary[outcome].summary.replace(
          invalidSourcePattern,
          ""
        ),
      };
    }
  });

  // Clean Uncategorized outcome
  if (cleanedSummary.Uncategorized && cleanedSummary.Uncategorized.summary) {
    cleanedSummary.Uncategorized = {
      ...cleanedSummary.Uncategorized,
      summary: cleanedSummary.Uncategorized.summary.replace(
        invalidSourcePattern,
        ""
      ),
    };
  }

  return cleanedSummary;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { time, identifier, title } = req.query;

  // Validate required parameters
  if (
    !time ||
    !identifier ||
    !title ||
    Array.isArray(time) ||
    Array.isArray(identifier) ||
    Array.isArray(title)
  ) {
    return res.status(400).json({
      error:
        "Missing required parameters: time, identifier, and title are required",
    });
  }

  // Validate environment variables
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const systemPrompt = process.env.SUMMARY_PROMPT;
  const promptVersion = process.env.SUMMARY_PROMPT_VERSION;

  if (!openaiApiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  if (!systemPrompt) {
    return res.status(500).json({ error: "Summary prompt not configured" });
  }

  if (!promptVersion) {
    return res
      .status(500)
      .json({ error: "Summary prompt version not configured" });
  }

  // Add batch processing environment variable validation
  const batchSize = parseInt(process.env.SUMMARY_BATCH_SIZE || "25");
  const condensationPrompt = process.env.SUMMARY_CONDENSATION_PROMPT;
  const condensationPromptVersion =
    process.env.SUMMARY_CONDENSATION_PROMPT_VERSION;

  if (!condensationPrompt) {
    return res
      .status(500)
      .json({ error: "Summary condensation prompt not configured" });
  }

  if (!condensationPromptVersion) {
    return res
      .status(500)
      .json({ error: "Summary condensation prompt version not configured" });
  }

  try {
    const startTime = Date.now();

    // Initialize Redis
    const redis = Redis.fromEnv();

    // Call UMA API first to get comment count for cache key determination
    const umaUrl = new URL("https://vote.uma.xyz/api/discord-thread");
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
    const topLevelComments = umaData.thread; // These are already top-level from the API

    // Update cache key logic based on comment count
    const isBatched = topLevelComments.length > batchSize;
    const promptVersionForCache = isBatched
      ? `${promptVersion}:${condensationPromptVersion}`
      : promptVersion;

    // Create unique cache key using all three parameters (simple format)
    const cacheKey = `discord-summary:${time}:${identifier}:${title}`;

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

      if (timeSinceLastUpdate < MAX_UPDATE_INTERVAL) {
        // Too soon to update, return existing data without fetching comments
        const processingTimeMs = Date.now() - startTime;
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

    let summaryData: StructuredSummary;

    if (topLevelComments.length <= batchSize) {
      // Single-pass processing (existing logic)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const summaryText = completion.choices[0]?.message?.content;

      if (!summaryText) {
        throw new Error("OpenAI returned empty response");
      }

      let openAIResponse: OpenAIResponse;
      try {
        openAIResponse = JSON.parse(summaryText) as OpenAIResponse;
      } catch (parseError) {
        throw new Error("Failed to parse OpenAI response as JSON");
      }

      summaryData = openAIResponse.summary;
    } else {
      // Batched processing
      const commentBatches = splitIntoBatches(topLevelComments, batchSize);
      const batchResults: BatchResult[] = [];

      // Process each batch
      for (let i = 0; i < commentBatches.length; i++) {
        const batch = commentBatches[i];
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

        const batchCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
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
          temperature: 0.3,
          response_format: { type: "json_object" },
        });

        const batchSummaryText = batchCompletion.choices[0]?.message?.content;

        if (!batchSummaryText) {
          throw new Error(
            `OpenAI returned empty response for batch ${batchNumber}`
          );
        }

        let batchSummary: OpenAIResponse;
        try {
          batchSummary = JSON.parse(batchSummaryText) as OpenAIResponse;
        } catch (parseError) {
          throw new Error(
            `Failed to parse batch ${batchNumber} response as JSON`
          );
        }

        batchResults.push({
          batchNumber,
          summary: batchSummary.summary,
          commentCount: batch.length,
          startIndex,
          endIndex,
        });
      }

      // Condense batch results
      const condensationPromptFormatted = formatCondensationPrompt(
        condensationPrompt,
        batchResults,
        title
      );

      const condensationCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: condensationPromptFormatted,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const condensedSummaryText =
        condensationCompletion.choices[0]?.message?.content;

      if (!condensedSummaryText) {
        throw new Error("OpenAI returned empty condensation response");
      }

      // Aggregate sources from all batches
      const aggregatedSources = aggregateSources(batchResults);

      // Inject sources into condensed summary
      summaryData = injectSourcesIntoSummary(
        condensedSummaryText,
        aggregatedSources
      );
    }

    // Clean placeholder source links from the summary data
    const cleanedSummaryData = cleanSummaryText(summaryData);

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
    };

    // Store in Redis permanently
    await redis.set(cacheKey, cacheData);

    // Return update metadata
    const processingTimeMs = Date.now() - startTime;
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
    console.error("Error in update-summary API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ error: `Failed to update summary: ${errorMessage}` });
  }
}
