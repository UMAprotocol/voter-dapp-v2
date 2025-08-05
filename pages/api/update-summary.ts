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
  processing?: boolean;
  error?: string;
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

      // Helper function to extract sources from nested structure
      const extractSources = (data: unknown): [string, number][] => {
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

      const outcomes: SummaryData = {
        P1: {
          summary: extractSummary(summaryData.P1),
          sources: extractSources(summaryData.P1) || aggregatedSources.P1 || [],
        },
        P2: {
          summary: extractSummary(summaryData.P2),
          sources: extractSources(summaryData.P2) || aggregatedSources.P2 || [],
        },
        P3: {
          summary: extractSummary(summaryData.P3),
          sources: extractSources(summaryData.P3) || aggregatedSources.P3 || [],
        },
        P4: {
          summary: extractSummary(summaryData.P4),
          sources: extractSources(summaryData.P4) || aggregatedSources.P4 || [],
        },
        Uncategorized: {
          summary: extractSummary(summaryData.Uncategorized),
          sources:
            extractSources(summaryData.Uncategorized) ||
            aggregatedSources.Uncategorized ||
            [],
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

  // Test the pattern with some examples
  console.log("=== REGEX TESTING ===");
  const testCases = [
    "[Source: aenews, 1753774056]",
    "[Source: reaper732, 1753774930]",
    "[Source: comment]",
    "[Source: https://www.janes.com/osint-insights/defence-news/security/thailand-cambodia-border-skirmish-continues-into-second-day]",
    "[Source: https://www.thaigov.go.th/news/contents/details/98884]",
    "[Source: https://www.khmertimeskh.com/501724968/cambodian-defense-ministry-thai-f-16-fighter-jets-bomb-preah-vihear-temple-wat-keo-sikha-kiriswar-and-ta-krabey-temple-today/]",
  ];
  testCases.forEach((test) => {
    const matches = test.match(usernameSourcePattern);
    console.log(
      `"${test}" -> matches: ${
        matches ? "YES (will be removed)" : "NO (will be preserved)"
      }`
    );
  });

  // Regex pattern to remove @https://vote.uma.xyz references
  const umaVotePattern = /\s*@https:\/\/vote\.uma\.xyz\s*/gi;

  const cleanedSummary = { ...summaryData };

  // Clean P1, P2, P3, P4 outcomes
  (["P1", "P2", "P3", "P4"] as const).forEach((outcome) => {
    if (cleanedSummary[outcome] && cleanedSummary[outcome].summary) {
      const originalSummary = cleanedSummary[outcome].summary;
      const cleanedSummaryText = originalSummary
        .replace(usernameSourcePattern, "")
        .replace(umaVotePattern, "");

      console.log(`=== CLEANING ${outcome} ===`);
      console.log("Original:", originalSummary.substring(0, 200) + "...");
      console.log(
        "After username pattern:",
        originalSummary.replace(usernameSourcePattern, "").substring(0, 200) +
          "..."
      );
      console.log(
        "Final cleaned:",
        cleanedSummaryText.substring(0, 200) + "..."
      );

      cleanedSummary[outcome] = {
        ...cleanedSummary[outcome],
        summary: cleanedSummaryText,
      };
    }
  });

  // Clean Uncategorized outcome
  if (cleanedSummary.Uncategorized && cleanedSummary.Uncategorized.summary) {
    cleanedSummary.Uncategorized = {
      ...cleanedSummary.Uncategorized,
      summary: cleanedSummary.Uncategorized.summary
        .replace(usernameSourcePattern, "")
        .replace(umaVotePattern, ""),
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

    // Create processing lock key to prevent concurrent processing
    const lockKey = `processing:discord-summary:${time}:${identifier}:${title}`;
    const lockTTL = 15 * 60; // 15 minutes in seconds

    // Try to acquire lock atomically
    const lockAcquired = await redis.set(
      lockKey,
      JSON.stringify({
        startedAt: new Date().toISOString(),
        startedBy: "update-summary-api",
      }),
      { nx: true, ex: lockTTL }
    );

    if (!lockAcquired) {
      // Another process is already working on this summary
      const processingTimeMs = Date.now() - startTime;
      return res.status(409).json({
        error: "Summary is already being processed",
        processing: true,
        processingTimeMs,
      });
    }

    // Wrap main processing in try/finally to ensure lock cleanup
    // Only clean up the lock if we successfully acquired it
    try {
      // Call UMA API first to get comment count for cache key determination
      if (!process.env.NEXT_PUBLIC_SITE_URL) {
        throw new Error("NEXT_PUBLIC_SITE_URL environment variable is not set");
      }
      const discordThreadBaseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/discord-thread`;

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

        console.log("=== SINGLE-PASS AI RESPONSE ===");
        console.log("Raw AI response:", markdownResponse);

        // For single-pass, parse the AI response and extract any source categorization
        summaryData = parseResponse(markdownResponse, {
          P1: [],
          P2: [],
          P3: [],
          P4: [],
          Uncategorized: [],
        });

        console.log("=== PARSED SINGLE-PASS SOURCES ===");
        console.log("P1 sources:", summaryData.P1.sources);
        console.log("P2 sources:", summaryData.P2.sources);
        console.log("P3 sources:", summaryData.P3.sources);
        console.log("P4 sources:", summaryData.P4.sources);
        console.log(
          "Uncategorized sources:",
          summaryData.Uncategorized.sources
        );

        // Deduplicate sources for single-pass processing too
        summaryData = deduplicateAllSources(summaryData);

        console.log("=== AFTER SINGLE-PASS DEDUPLICATION ===");
        console.log("Summary data after deduplication:", {
          P1: {
            sources: summaryData.P1.sources,
            summaryLength: summaryData.P1.summary.length,
          },
          P2: {
            sources: summaryData.P2.sources,
            summaryLength: summaryData.P2.summary.length,
          },
          P3: {
            sources: summaryData.P3.sources,
            summaryLength: summaryData.P3.summary.length,
          },
          P4: {
            sources: summaryData.P4.sources,
            summaryLength: summaryData.P4.summary.length,
          },
          Uncategorized: {
            sources: summaryData.Uncategorized.sources,
            summaryLength: summaryData.Uncategorized.summary.length,
          },
        });
      } else {
        // Batched processing for markdown
        const commentBatches = splitIntoBatches(topLevelComments, batchSize);
        const batchResults: BatchResult[] = [];

        // Process each batch
        for (let i = 0; i < commentBatches.length; i++) {
          const batch = commentBatches[i];
          const batchNumber = i + 1;
          const startIndex = i * batchSize + 1;
          const endIndex = Math.min(
            (i + 1) * batchSize,
            topLevelComments.length
          );

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

          console.log(`=== BATCH ${batchNumber} AI RESPONSE ===`);
          console.log("Raw batch response:", batchSummaryText);

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

            console.log(`=== BATCH ${batchNumber} EXTRACTED SOURCES ===`);
            console.log("Extracted sources:", extractedSources);

            batchResults.push({
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

        console.log("=== CONDENSATION AI RESPONSE ===");
        console.log("Raw condensation response:", condensedSummaryText);

        // Parse the condensed response first
        summaryData = parseResponse(condensedSummaryText, {
          P1: [],
          P2: [],
          P3: [],
          P4: [],
          Uncategorized: [],
        });

        console.log("=== BEFORE SOURCE AGGREGATION ===");
        console.log("Summary data sources before aggregation:", {
          P1: summaryData.P1.sources,
          P2: summaryData.P2.sources,
          P3: summaryData.P3.sources,
          P4: summaryData.P4.sources,
          Uncategorized: summaryData.Uncategorized.sources,
        });

        // Aggregate sources from all batch results
        summaryData = aggregateSourcesFromBatches(summaryData, batchResults);

        console.log("=== AFTER SOURCE AGGREGATION ===");
        console.log("Summary data sources after aggregation:", {
          P1: summaryData.P1.sources,
          P2: summaryData.P2.sources,
          P3: summaryData.P3.sources,
          P4: summaryData.P4.sources,
          Uncategorized: summaryData.Uncategorized.sources,
        });
      }

      // Deduplicate sources to ensure no commenter appears multiple times
      summaryData = deduplicateAllSources(summaryData);

      console.log("=== AFTER DEDUPLICATION ===");
      console.log("Summary data after deduplication:", {
        P1: {
          sources: summaryData.P1.sources,
          summaryLength: summaryData.P1.summary.length,
        },
        P2: {
          sources: summaryData.P2.sources,
          summaryLength: summaryData.P2.summary.length,
        },
        P3: {
          sources: summaryData.P3.sources,
          summaryLength: summaryData.P3.summary.length,
        },
        P4: {
          sources: summaryData.P4.sources,
          summaryLength: summaryData.P4.summary.length,
        },
        Uncategorized: {
          sources: summaryData.Uncategorized.sources,
          summaryLength: summaryData.Uncategorized.summary.length,
        },
      });

      console.log("=== BEFORE CLEANING ===");
      console.log("Summary data before cleaning:", {
        P1: {
          sources: summaryData.P1.sources,
          summaryLength: summaryData.P1.summary.length,
        },
        P2: {
          sources: summaryData.P2.sources,
          summaryLength: summaryData.P2.summary.length,
        },
        P3: {
          sources: summaryData.P3.sources,
          summaryLength: summaryData.P3.summary.length,
        },
        P4: {
          sources: summaryData.P4.sources,
          summaryLength: summaryData.P4.summary.length,
        },
        Uncategorized: {
          sources: summaryData.Uncategorized.sources,
          summaryLength: summaryData.Uncategorized.summary.length,
        },
      });

      // Clean placeholder source links from the summary data
      const cleanedSummaryData = cleanSummaryText(summaryData);

      console.log("=== AFTER CLEANING ===");
      console.log("Summary data after cleaning:", {
        P1: {
          sources: cleanedSummaryData.P1.sources,
          summaryLength: cleanedSummaryData.P1.summary.length,
        },
        P2: {
          sources: cleanedSummaryData.P2.sources,
          summaryLength: cleanedSummaryData.P2.summary.length,
        },
        P3: {
          sources: cleanedSummaryData.P3.sources,
          summaryLength: cleanedSummaryData.P3.summary.length,
        },
        P4: {
          sources: cleanedSummaryData.P4.sources,
          summaryLength: cleanedSummaryData.P4.summary.length,
        },
        Uncategorized: {
          sources: cleanedSummaryData.Uncategorized.sources,
          summaryLength: cleanedSummaryData.Uncategorized.summary.length,
        },
      });

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
    } finally {
      // Always clean up the processing lock
      try {
        await redis.del(lockKey);
      } catch (cleanupError) {
        console.error("Failed to clean up processing lock:", cleanupError);
      }
    }
  } catch (error) {
    console.error("Error in update-summary API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res
      .status(500)
      .json({ error: `Failed to update summary: ${errorMessage}` });
  }
}
