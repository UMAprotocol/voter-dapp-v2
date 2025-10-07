import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { BigNumber } from "ethers";
import { resolveAncillaryData } from "lib/l2-ancillary-data";

const TTL = 60 * 60 * 24 * 365; // 1 year

// Request validation schema
const ResolveAncillaryDataRequestSchema = ss.object({
  identifier: ss.string(),
  time: ss.string(),
  ancillaryData: ss.string(),
});

export type ResolveAncillaryDataResponse = {
  resolvedAncillaryData: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResolveAncillaryDataResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Set caching headers
  res.setHeader("Cache-Control", `public, max-age=${TTL}, s-maxage=${TTL}`);

  try {
    // Validate request query parameters
    const requestBody = ss.create(req.query, ResolveAncillaryDataRequestSchema);

    const result = await resolveAncillaryData({
      identifier: requestBody.identifier,
      time: BigNumber.from(requestBody.time),
      ancillaryData: requestBody.ancillaryData,
    });

    console.log(
      `[L2 Ancillary Data] Resolved for identifier: ${requestBody.identifier}`
    );

    return res.status(200).json({
      resolvedAncillaryData: result.resolvedAncillaryData,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[L2 Ancillary Data] Error: ${errorMessage}`);

    return res.status(500).json({
      error: `Failed to resolve L2 ancillary data: ${errorMessage}`,
    });
  }
}
