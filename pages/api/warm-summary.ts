import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

// Event ABI for PriceRequestBridged
const PRICE_REQUEST_BRIDGED_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "identifier",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "ancillaryData",
        type: "bytes",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "childRequestId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "parentRequestId",
        type: "bytes32",
      },
    ],
    name: "PriceRequestBridged",
    type: "event",
  },
];

interface PriceRequestEvent {
  requester: string;
  identifier: string;
  time: bigint;
  ancillaryData: string;
  childRequestId: string;
  parentRequestId: string;
  blockNumber: number;
  transactionHash: string;
}

// Interface for update-summary API response
interface UpdateSummaryResponse {
  updated: boolean;
  cached: boolean;
  generatedAt: string;
  commentsHash: string;
  promptVersion: string;
  processingTimeMs: number;
}

// Interface for node URLs configuration
interface NodeUrls {
  [chainId: string]: string;
}

interface WarmSummaryResponse {
  success: boolean;
  processed: number;
  skipped: number;
  errors: number;
  totalEvents: number;
  processingTimeMs: number;
  details: {
    successfulUpdates: string[];
    skippedUpdates: string[];
    errorUpdates: { url: string; error: string }[];
  };
}

const ORACLE_CHILD_TUNNEL_ADDRESS =
  "0xac60353a54873c446101216829a6A98cDbbC3f3D";
const WARM_SUMMARY_CONCURRENCY_SIZE = parseInt(
  process.env.WARM_SUMMARY_CONCURRENCY_SIZE || "5",
  10
);
const MAX_EVENTS = 1000;
const WARM_SUMMARY_MAX_AGE_DAYS = parseInt(
  process.env.WARM_SUMMARY_MAX_AGE_DAYS || "5",
  10
);

function decodeAncillaryData(ancillaryData: string): string {
  try {
    // Remove 0x prefix if present
    const cleanHex = ancillaryData.startsWith("0x")
      ? ancillaryData.slice(2)
      : ancillaryData;

    // Convert hex to string
    let decoded = Buffer.from(cleanHex, "hex").toString("utf8");

    // If the decoded string looks URL-encoded, decode it first
    if (decoded.includes("%")) {
      try {
        decoded = decodeURIComponent(decoded);
      } catch (decodeError) {
        console.warn("Failed to URL decode ancillary data:", decoded);
      }
    }

    console.log(`🔍 Debug - Raw decoded: "${decoded}"`);

    // Simple extraction: find "title: " and extract until ", description"
    const titleStart = decoded.indexOf("title: ");
    const descriptionStart = decoded.indexOf(", description");

    if (
      titleStart !== -1 &&
      descriptionStart !== -1 &&
      descriptionStart > titleStart
    ) {
      let title = decoded.substring(titleStart + 7, descriptionStart).trim(); // +7 to skip "title: "
      title = title.replace(/\+/g, " "); // Replace + with spaces
      console.log(`📝 Extracted title: "${title}" from decoded: "${decoded}"`);
      return title;
    }

    // Fallback: if no description delimiter, just take everything before the first comma
    const beforeComma = decoded.split(",")[0].trim();
    if (beforeComma && beforeComma.length > 5) {
      const title = beforeComma.replace(/\+/g, " ");
      console.log(
        `📝 Using text before comma: "${title}" from decoded: "${decoded}"`
      );
      return title;
    }

    // If no specific title format, try to extract readable text
    const cleanDecoded = decoded.replace(/[^\x20-\x7E]/g, "").trim();
    return cleanDecoded || "Unknown Title";
  } catch (error) {
    console.warn("Failed to decode ancillary data:", ancillaryData, error);
    return "Unknown Title";
  }
}

function buildUpdateSummaryUrl(
  event: PriceRequestEvent,
  title: string
): string {
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error("NEXT_PUBLIC_SITE_URL environment variable is not set");
  }
  const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/update-summary`;

  // Build URL manually to control encoding format
  // Replace spaces with + and encode special characters
  const encodedTitle = title
    .replace(/ /g, "+") // Replace spaces with +
    .replace(/\?/g, "%3F") // Encode ? as %3F
    .replace(/&/g, "%26") // Encode & as %26
    .replace(/#/g, "%23") // Encode # as %23
    .replace(/=/g, "%3D"); // Encode = as %3D

  return `${baseUrl}?time=${event.time.toString()}&identifier=${
    event.identifier
  }&title=${encodedTitle}`;
}

async function batchUpdateSummaries(urls: string[]): Promise<{
  successful: string[];
  errors: { url: string; error: string }[];
}> {
  const successful: string[] = [];
  const errors: { url: string; error: string }[] = [];

  const promises = urls.map(async (url) => {
    try {
      console.log(`📤 Calling: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: UpdateSummaryResponse =
        (await response.json()) as UpdateSummaryResponse;
      console.log(
        `✅ Success: ${url} - Updated: ${String(
          result.updated
        )}, Cached: ${String(result.cached)}`
      );
      successful.push(url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(`❌ Error: ${url} - ${errorMessage}`);
      errors.push({ url, error: errorMessage });
    }
  });

  await Promise.all(promises);
  return { successful, errors };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WarmSummaryResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const startTime = Date.now();
  console.log("🔥 Starting warm-summary process...");

  // Validate environment variables
  if (!process.env.NODE_URLS) {
    return res
      .status(500)
      .json({ error: "NODE_URLS environment variable not set" });
  }

  let nodeUrls: NodeUrls;
  try {
    nodeUrls = JSON.parse(process.env.NODE_URLS) as NodeUrls;
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Invalid NODE_URLS format - must be valid JSON" });
  }

  const polygonRpcUrl = nodeUrls["137"]; // Chain ID 137 is Polygon

  if (!polygonRpcUrl) {
    return res.status(500).json({
      error:
        "Polygon RPC URL not configured in NODE_URLS (missing chain ID 137)",
    });
  }

  try {
    // Setup Polygon provider
    console.log("🌐 Connecting to Polygon...");
    const provider = new ethers.providers.JsonRpcProvider(polygonRpcUrl);

    // Create contract interface
    const contractInterface = new ethers.utils.Interface(
      PRICE_REQUEST_BRIDGED_ABI
    );

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    console.log(`📦 Current block: ${currentBlock}`);

    // Calculate block range (approximately 3 days worth of blocks)
    // Polygon averages ~2 second block time, so 3 days = ~129,600 blocks
    const blocksPerDay = 43200; // 24 * 60 * 60 / 2
    const fromBlock = Math.max(
      0,
      currentBlock - blocksPerDay * WARM_SUMMARY_MAX_AGE_DAYS
    );

    console.log(
      `🔍 Querying events from block ${fromBlock} to ${currentBlock}...`
    );

    // Query events
    const eventFragment = contractInterface.getEvent("PriceRequestBridged");
    if (!eventFragment) {
      throw new Error("Could not find PriceRequestBridged event");
    }
    const eventTopic = contractInterface.getEventTopic(eventFragment);

    const logs = await provider.getLogs({
      address: ORACLE_CHILD_TUNNEL_ADDRESS,
      topics: [eventTopic],
      fromBlock,
      toBlock: currentBlock,
    });

    console.log(`📋 Found ${logs.length} raw events`);

    // Parse and filter events
    const parsedEvents: PriceRequestEvent[] = [];
    const cutoffTime =
      Math.floor(Date.now() / 1000) - WARM_SUMMARY_MAX_AGE_DAYS * 24 * 60 * 60;

    for (const log of logs.slice(-MAX_EVENTS)) {
      // Take most recent events
      try {
        const parsed = contractInterface.parseLog(log);
        if (!parsed) continue;

        const event: PriceRequestEvent = {
          requester: parsed.args.requester as string,
          identifier: parsed.args.identifier as string,
          time: parsed.args.time as bigint,
          ancillaryData: parsed.args.ancillaryData as string,
          childRequestId: parsed.args.childRequestId as string,
          parentRequestId: parsed.args.parentRequestId as string,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        };

        // Filter by time (only events from last 3 days)
        if (Number(event.time) >= cutoffTime) {
          parsedEvents.push(event);
        }
      } catch (parseError) {
        console.warn(
          `⚠️  Failed to parse event in block ${log.blockNumber}:`,
          parseError
        );
      }
    }

    console.log(
      `✅ Parsed ${parsedEvents.length} valid events (filtered for last ${WARM_SUMMARY_MAX_AGE_DAYS} days)`
    );

    if (parsedEvents.length === 0) {
      return res.status(200).json({
        success: true,
        processed: 0,
        skipped: 0,
        errors: 0,
        totalEvents: 0,
        processingTimeMs: Date.now() - startTime,
        details: {
          successfulUpdates: [],
          skippedUpdates: [],
          errorUpdates: [],
        },
      });
    }

    // Build URLs for update-summary calls
    console.log("🔗 Building update-summary URLs...");
    const updateUrls: string[] = [];
    const skippedUrls: string[] = [];

    for (const event of parsedEvents) {
      try {
        const title = decodeAncillaryData(event.ancillaryData);
        const url = buildUpdateSummaryUrl(event, title);
        updateUrls.push(url);
        console.log(
          `📝 Event ${event.childRequestId.slice(0, 10)}... -> "${title}"`
        );
      } catch (error) {
        console.warn(`⚠️  Skipping event ${event.childRequestId}:`, error);
        skippedUrls.push(event.childRequestId);
      }
    }

    console.log(
      `🚀 Processing ${updateUrls.length} URLs in batches of ${WARM_SUMMARY_CONCURRENCY_SIZE}...`
    );

    // Process in batches
    const allSuccessful: string[] = [];
    const allErrors: { url: string; error: string }[] = [];

    for (let i = 0; i < updateUrls.length; i += WARM_SUMMARY_CONCURRENCY_SIZE) {
      const batch = updateUrls.slice(i, i + WARM_SUMMARY_CONCURRENCY_SIZE);
      const batchNumber = Math.floor(i / WARM_SUMMARY_CONCURRENCY_SIZE) + 1;
      const totalBatches = Math.ceil(
        updateUrls.length / WARM_SUMMARY_CONCURRENCY_SIZE
      );

      console.log(
        `📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} URLs)...`
      );

      const { successful, errors } = await batchUpdateSummaries(batch);
      allSuccessful.push(...successful);
      allErrors.push(...errors);

      console.log(
        `✅ Batch ${batchNumber} complete: ${successful.length} success, ${errors.length} errors`
      );

      // Add small delay between batches to be nice to the API
      if (i + WARM_SUMMARY_CONCURRENCY_SIZE < updateUrls.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const processingTimeMs = Date.now() - startTime;

    console.log(`🎉 Warm-summary complete!`);
    console.log(`📊 Total: ${parsedEvents.length} events`);
    console.log(`✅ Successful: ${allSuccessful.length}`);
    console.log(`⏭️  Skipped: ${skippedUrls.length}`);
    console.log(`❌ Errors: ${allErrors.length}`);
    console.log(`⏱️  Time: ${processingTimeMs}ms`);

    return res.status(200).json({
      success: true,
      processed: allSuccessful.length,
      skipped: skippedUrls.length,
      errors: allErrors.length,
      totalEvents: parsedEvents.length,
      processingTimeMs,
      details: {
        successfulUpdates: allSuccessful,
        skippedUpdates: skippedUrls,
        errorUpdates: allErrors,
      },
    });
  } catch (error) {
    console.error("💥 Error in warm-summary:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return res.status(500).json({
      error: `Failed to warm summaries: ${errorMessage}`,
    });
  }
}
