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
  model: string;
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

    console.log(`=== CONDENSATION BATCH ${index + 1} INPUT ===`);

    // Extract only summary text for each outcome
    Object.entries(batchResult.summary).forEach(
      ([outcome, data]: [string, unknown]) => {
        if (
          outcome !== "sources" &&
          data &&
          typeof data === "string" &&
          data.trim()
        ) {
          console.log(`${outcome} summary length: ${data.length}`);
          console.log(
            `${outcome} contains URLs: ${String(data.includes("http"))}`
          );
          console.log(
            `${outcome} contains bullets: ${String(data.includes("•"))}`
          );
          console.log(`${outcome} text preview: ${data.substring(0, 200)}...`);
          summariesText += `${outcome}: ${data}\n`;
        }
      }
    );

    summariesText += `</Summary>
</BatchSummary>

`;
  });

  console.log("=== FULL CONDENSATION PROMPT ===");
  console.log("Condensation prompt length:", summariesText.length);
  console.log(
    "Contains URLs in condensation input:",
    summariesText.includes("http")
  );

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

// Helper function to clean username/timestamp source references from summary text
function cleanSummaryText(summaryData: SummaryData): SummaryData {
  // Pattern to match username/timestamp sources but preserve URL sources
  // This matches [Source: word] or [Source: word, number] but NOT URLs
  const usernameSourcePattern =
    /\s*\[Source:\s*[a-zA-Z0-9._-]+(?:\s*,\s*\d+)?\s*\]\.?/gi;

  // Regex pattern to convert URLs to markdown links for proper rendering
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;

  // Pattern to remove empty parentheses
  const emptyParenthesesPattern = /\s*\(\s*\)\.?/gi;

  // Pattern to fix malformed source references like (source.). to (source).
  const malformedSourcePattern = /\(\s*source\s*\)\s*\./gi;

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
      const afterUrlConversion = afterUsernameClean.replace(
        urlPattern,
        "[source]($1)"
      );
      // Remove empty parentheses
      const afterEmptyParenthesesRemoval = afterUrlConversion.replace(
        emptyParenthesesPattern,
        ""
      );
      // Fix malformed source references
      const finalCleaned = afterEmptyParenthesesRemoval.replace(
        malformedSourcePattern,
        "(source)."
      );

      console.log(`=== CLEANING ${outcome} ===`);
      console.log("Original contains URLs:", originalSummary.includes("http"));
      console.log("Original contains bullets:", originalSummary.includes("•"));
      console.log(
        "Original contains empty parentheses:",
        originalSummary.includes("()")
      );
      console.log(
        "Original contains malformed sources:",
        /\(\s*source\s*\)\s*\./gi.test(originalSummary)
      );
      console.log(
        "After username clean contains URLs:",
        afterUsernameClean.includes("http")
      );
      console.log(
        "Final contains [source]:",
        finalCleaned.includes("[source]")
      );
      console.log("Final contains bullets:", finalCleaned.includes("•"));
      console.log("Final contains http:", finalCleaned.includes("http"));
      console.log(
        "Final contains empty parentheses:",
        finalCleaned.includes("()")
      );

      if (
        originalSummary.includes("http") ||
        originalSummary.includes("()") ||
        /\(\s*source\s*\)\s*\./gi.test(originalSummary)
      ) {
        console.log(
          "Original text:",
          originalSummary.substring(0, 400) + "..."
        );
        console.log("Final text:", finalCleaned.substring(0, 400) + "...");
      }

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
    const afterUrlConversion = afterUsernameClean.replace(
      urlPattern,
      "[source]($1)"
    );
    // Remove empty parentheses
    const afterEmptyParenthesesRemoval = afterUrlConversion.replace(
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
  const model = process.env.OPENAI_MODEL || "gpt-4.1";
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
    const protocol = Array.isArray(req.headers["x-forwarded-proto"])
      ? req.headers["x-forwarded-proto"][0]
      : req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || "localhost";
    const discordThreadBaseUrl = `${protocol}://${host}/api/discord-thread`;

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
      console.log(
        "Single-pass response contains bullets:",
        markdownResponse.includes("•")
      );

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
      console.log("Uncategorized sources:", summaryData.Uncategorized.sources);

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
        const endIndex = Math.min((i + 1) * batchSize, topLevelComments.length);

        console.log(`=== BATCH ${batchNumber} INPUT ANALYSIS ===`);
        console.log(`Batch size: ${batch.length} comments`);

        // Check what URLs are in the original comments for this batch
        const urlsInBatch: string[] = [];
        batch.forEach((comment, idx) => {
          const urls = comment.message.match(
            /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi
          );
          if (urls) {
            console.log(
              `Comment ${idx + 1} by ${comment.sender} contains URLs:`,
              urls
            );
            urlsInBatch.push(...urls);
          }
        });
        console.log(`Total unique URLs in batch ${batchNumber}:`, [
          ...new Set(urlsInBatch),
        ]);

        const batchPromptFormatted = formatBatchPrompt(
          systemPrompt,
          batch,
          title,
          batchNumber,
          commentBatches.length,
          startIndex,
          endIndex
        );

        console.log(`=== BATCH ${batchNumber} FULL PROMPT ===`);
        console.log(
          "Prompt contains URLs:",
          batchPromptFormatted.includes("http")
        );
        if (batchPromptFormatted.includes("http")) {
          console.log(
            "First 1000 chars of prompt:",
            batchPromptFormatted.substring(0, 1000)
          );
        }

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

          console.log(`=== BATCH ${batchNumber} EXTRACTED SUMMARIES ===`);
          const outcomes = ["P1", "P2", "P3", "P4", "Uncategorized"] as const;
          outcomes.forEach((outcome) => {
            const summary = extractSummary(summaryData[outcome]);
            const hasContent = summary.trim().length > 0;
            const hasUrls = summary.includes("http");
            console.log(
              `${outcome}: ${hasContent ? "HAS CONTENT" : "EMPTY"} (${
                summary.length
              } chars, URLs: ${String(hasUrls)})`
            );
            if (hasContent) {
              console.log(`  Content: ${summary.substring(0, 300)}...`);
              if (!hasUrls && urlsInBatch.length > 0) {
                console.log(
                  `  ⚠️  BATCH HAD ${urlsInBatch.length} URLs BUT AI IGNORED THEM FOR ${outcome}`
                );
              }
            }
          });

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
      console.log("=== PRE-CONDENSATION ANALYSIS ===");
      console.log(`Total batches processed: ${batchResults.length}`);

      // Check what content each batch actually has
      batchResults.forEach((batch, idx) => {
        console.log(`Batch ${idx + 1} summary content:`);
        Object.entries(batch.summary).forEach(([outcome, data]) => {
          if (outcome !== "sources" && typeof data === "string") {
            const hasContent = data.trim().length > 0;
            const hasUrls = data.includes("http");
            console.log(
              `  ${outcome}: ${hasContent ? "HAS CONTENT" : "EMPTY"} (${
                data.length
              } chars, URLs: ${String(hasUrls)})`
            );
            if (hasContent && hasUrls) {
              console.log(`    First 200 chars: ${data.substring(0, 200)}...`);
            }
          }
        });
      });

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
      console.log(
        "Condensation response contains URLs:",
        condensedSummaryText.includes("http")
      );
      console.log(
        "Condensation response contains bullets:",
        condensedSummaryText.includes("•")
      );

      // Parse condensation response to check for hallucination
      try {
        const condensationCheck = JSON.parse(
          condensedSummaryText
        ) as OpenAIJsonResponse;
        const summaryCheck = condensationCheck.summary || condensationCheck;
        console.log("=== CONDENSATION HALLUCINATION CHECK ===");
        Object.entries(summaryCheck).forEach(([outcome, data]) => {
          if (
            typeof data === "string" ||
            (data && typeof data === "object" && "summary" in data)
          ) {
            const summaryText =
              typeof data === "string"
                ? data
                : (data as { summary?: string }).summary;
            if (
              summaryText &&
              typeof summaryText === "string" &&
              summaryText.trim()
            ) {
              console.log(
                `CONDENSATION CREATED ${outcome} CONTENT: ${String(
                  summaryText.substring(0, 200)
                )}...`
              );
              // Check if this outcome was empty in all batches
              const hadContentInBatches = batchResults.some((batch) => {
                const batchOutcome =
                  batch.summary[outcome as keyof typeof batch.summary];
                return (
                  typeof batchOutcome === "string" &&
                  batchOutcome.trim().length > 0
                );
              });
              if (!hadContentInBatches) {
                console.log(
                  `🚨 HALLUCINATION DETECTED: ${outcome} was empty in all batches but condensation created content!`
                );
              }
            }
          }
        });
      } catch (e) {
        console.log(
          "Could not parse condensation response for hallucination check"
        );
      }

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

    console.log("=== BEFORE CLEANING URLs ===");
    (["P1", "P2", "P3", "P4", "Uncategorized"] as const).forEach((outcome) => {
      const summary = summaryData[outcome].summary;
      console.log(
        `${outcome} contains URLs before cleaning: ${String(
          summary.includes("http")
        )}`
      );
      if (summary.includes("http")) {
        console.log(`${outcome} URL preview: ${summary.substring(0, 300)}...`);
      }
    });

    // Clean placeholder source links from the summary data
    const cleanedSummaryData = cleanSummaryText(summaryData);

    console.log("=== AFTER CLEANING URLs ===");
    (["P1", "P2", "P3", "P4", "Uncategorized"] as const).forEach((outcome) => {
      const summary = cleanedSummaryData[outcome].summary;
      console.log(
        `${outcome} contains URLs after cleaning: ${String(
          summary.includes("http")
        )}`
      );
      console.log(
        `${outcome} contains [source] after cleaning: ${String(
          summary.includes("[source]")
        )}`
      );
      if (summary.includes("[source]") || summary.includes("http")) {
        console.log(
          `${outcome} final preview: ${summary.substring(0, 300)}...`
        );
      }
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
      model,
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
