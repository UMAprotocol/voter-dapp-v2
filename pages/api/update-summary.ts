import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import OpenAI from "openai";
import { createHash } from "crypto";

// Default maximum interval between summary updates (5 minutes in milliseconds)
const DEFAULT_MAX_UPDATE_INTERVAL = 5 * 60 * 1000;

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

// Summary data structures
interface SummaryOutcomeData {
  summary: string;
  sources: [string, number][];
}

interface SummaryData {
  P1: SummaryOutcomeData;
  P2: SummaryOutcomeData;
  P3: SummaryOutcomeData;
  P4: SummaryOutcomeData;
  Uncategorized: SummaryOutcomeData;
}

// Interface for what OpenAI returns (JSON response)
interface OpenAIJsonResponse {
  summary?: {
    P1?: { summary?: string } | string;
    P2?: { summary?: string } | string;
    P3?: { summary?: string } | string;
    P4?: { summary?: string } | string;
    Uncategorized?: { summary?: string } | string;
  };
  P1?: { summary?: string } | string;
  P2?: { summary?: string } | string;
  P3?: { summary?: string } | string;
  P4?: { summary?: string } | string;
  Uncategorized?: { summary?: string } | string;
  sources?: Record<string, [string, number][]>;
}

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

// Simplified cache data structure
interface CacheData {
  P1: SummaryOutcomeData;
  P2: SummaryOutcomeData;
  P3: SummaryOutcomeData;
  P4: SummaryOutcomeData;
  Uncategorized: SummaryOutcomeData;
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
      ([outcome, data]: [string, string]) => {
        if (outcome !== "sources" && data && data.trim()) {
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
      const jsonResponse = JSON.parse(cleanedResponse) as OpenAIJsonResponse;

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

      const outcomes: SummaryData = {
        P1: {
          summary: extractSummary(summaryData.P1),
          sources: aggregatedSources.P1 || [],
        },
        P2: {
          summary: extractSummary(summaryData.P2),
          sources: aggregatedSources.P2 || [],
        },
        P3: {
          summary: extractSummary(summaryData.P3),
          sources: aggregatedSources.P3 || [],
        },
        P4: {
          summary: extractSummary(summaryData.P4),
          sources: aggregatedSources.P4 || [],
        },
        Uncategorized: {
          summary: extractSummary(summaryData.Uncategorized),
          sources: aggregatedSources.Uncategorized || [],
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

// Helper function to clean placeholder source links from summary text
function cleanSummaryText(summaryData: SummaryData): SummaryData {
  // Regex pattern to match [Source: ...] patterns that don't contain valid URLs
  // This will match [Source: anything] that doesn't contain http:// or https://
  const invalidSourcePattern =
    /\s*\[Source:[^\]]*(?<!https?:\/\/[^\]]*)\]\.?/gi;

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
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const maxUpdateInterval = parseInt(
    process.env.MAX_UPDATE_INTERVAL || DEFAULT_MAX_UPDATE_INTERVAL.toString()
  );

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return res
        .status(500)
        .json({ error: "NEXT_PUBLIC_SITE_URL not configured" });
    }
    const discordThreadBaseUrl = `${siteUrl}/api/discord-thread`;

    const umaUrl = new URL(discordThreadBaseUrl);
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

      if (timeSinceLastUpdate < maxUpdateInterval) {
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

    let summaryData: SummaryData;

    if (topLevelComments.length <= batchSize) {
      // Single-pass processing for markdown
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
        temperature: 0.3,
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

      // If AI didn't categorize sources properly, distribute users based on non-empty summaries
      const totalUsers = topLevelComments.length;
      if (totalUsers > 0) {
        const nonEmptyOutcomes = (["P1", "P2", "P3", "P4"] as const).filter(
          (outcome) => summaryData[outcome].summary.trim().length > 0
        );

        if (nonEmptyOutcomes.length > 0) {
          // Distribute users across outcomes that have content
          const usersPerOutcome = Math.floor(
            totalUsers / nonEmptyOutcomes.length
          );
          let userIndex = 0;

          nonEmptyOutcomes.forEach((outcome, outcomeIndex) => {
            const endIndex =
              outcomeIndex === nonEmptyOutcomes.length - 1
                ? totalUsers // Last outcome gets any remaining users
                : userIndex + usersPerOutcome;

            for (let i = userIndex; i < endIndex && i < totalUsers; i++) {
              const comment = topLevelComments[i];
              summaryData[outcome].sources.push([comment.sender, comment.time]);
            }
            userIndex = endIndex;
          });
        } else {
          // Fallback: put all users in Uncategorized if no outcomes have content
          topLevelComments.forEach((comment) => {
            summaryData.Uncategorized.sources.push([
              comment.sender,
              comment.time,
            ]);
          });
        }
      }
    } else {
      // Batched processing for markdown
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
          temperature: 0.3,
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
          const batchParsedResponse = JSON.parse(
            batchSummaryText
          ) as OpenAIJsonResponse;

          // Helper function to extract summary text
          const extractSummary = (data: unknown): string => {
            if (typeof data === "string") return data;
            if (data && typeof data === "object" && "summary" in data) {
              const obj = data as { summary: unknown };
              return typeof obj.summary === "string" ? obj.summary : "";
            }
            return "";
          };

          // Handle nested summary structure for condensation
          const summaryData =
            batchParsedResponse.summary || batchParsedResponse;

          batchResults.push({
            batchNumber,
            summary: {
              P1: extractSummary(summaryData.P1),
              P2: extractSummary(summaryData.P2),
              P3: extractSummary(summaryData.P3),
              P4: extractSummary(summaryData.P4),
              Uncategorized: extractSummary(summaryData.Uncategorized),
              sources: batchParsedResponse.sources || {},
            },
            commentCount: batch.length,
            startIndex,
            endIndex,
          });
        } catch (error) {
          // If JSON parsing fails, fallback to putting everything in Uncategorized
          batchResults.push({
            batchNumber,
            summary: {
              P1: "",
              P2: "",
              P3: "",
              P4: "",
              Uncategorized: batchSummaryText,
            },
            commentCount: batch.length,
            startIndex,
            endIndex,
          });
        }
      }

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
        temperature: 0.3,
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

      // Distribute users across outcomes that have content
      const totalUsers = topLevelComments.length;
      if (totalUsers > 0) {
        const nonEmptyOutcomes = (["P1", "P2", "P3", "P4"] as const).filter(
          (outcome) => summaryData[outcome].summary.trim().length > 0
        );

        if (nonEmptyOutcomes.length > 0) {
          // Distribute users across outcomes that have content
          const usersPerOutcome = Math.floor(
            totalUsers / nonEmptyOutcomes.length
          );
          let userIndex = 0;

          nonEmptyOutcomes.forEach((outcome, outcomeIndex) => {
            const endIndex =
              outcomeIndex === nonEmptyOutcomes.length - 1
                ? totalUsers // Last outcome gets any remaining users
                : userIndex + usersPerOutcome;

            for (let i = userIndex; i < endIndex && i < totalUsers; i++) {
              const comment = topLevelComments[i];
              summaryData[outcome].sources.push([comment.sender, comment.time]);
            }
            userIndex = endIndex;
          });
        } else {
          // Fallback: put all users in Uncategorized if no outcomes have content
          topLevelComments.forEach((comment) => {
            summaryData.Uncategorized.sources.push([
              comment.sender,
              comment.time,
            ]);
          });
        }
      }
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
