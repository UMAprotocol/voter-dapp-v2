import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import OpenAI from "openai";
import { createHash } from "crypto";

// Maximum interval between summary updates (5 minutes in milliseconds)
const MAX_UPDATE_INTERVAL = 5 * 60 * 1000;

interface DiscordMessage {
  message: string;
  sender: string;
  senderPicture: string;
  time: number;
  id: string;
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

interface SummaryResponse {
  summary: StructuredSummary;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
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

  try {
    const startTime = Date.now();

    // Initialize Redis
    const redis = Redis.fromEnv();
    // Create unique cache key using all three parameters
    const cacheKey = `discord-summary:${time}:${identifier}:${title}`;

    // Check cache first to see if we need to respect the update interval
    const cachedData = await redis.get<CacheData>(cacheKey);

    if (cachedData) {
      const timeSinceLastUpdate = Date.now() - new Date(cachedData.generatedAt).getTime();
      
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

    // Call UMA API (only if we passed the time check)
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

    // Format messages for OpenAI and compute hash
    const formattedComments = umaData.thread
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

    // Check if content or prompt has changed (we already passed the time check)
    if (
      cachedData &&
      cachedData.commentsHash === commentsHash &&
      cachedData.promptVersion === promptVersion
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

    // Extract just the P1/P2/P3/P4 data from the OpenAI response
    const summaryData = openAIResponse.summary;

    // Create cache data (simplified structure with P1/P2/P3/P4 at top level)
    const now = new Date().toISOString();
    const cacheData: CacheData = {
      P1: summaryData.P1,
      P2: summaryData.P2,
      P3: summaryData.P3,
      P4: summaryData.P4,
      Uncategorized: summaryData.Uncategorized,
      generatedAt: now,
      commentsHash,
      promptVersion,
      cachedAt: now,
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
      promptVersion,
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
