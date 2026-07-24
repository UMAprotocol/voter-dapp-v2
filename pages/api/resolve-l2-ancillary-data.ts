import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { BigNumber } from "ethers";
import { resolveAncillaryData } from "lib/l2-ancillary-data";
import { validateQueryParams } from "./_utils/validation";
import { handleApiError } from "./_utils/errors";
import { hexString, positiveIntStr } from "helpers/validators";

const TTL = 60 * 60 * 24 * 365; // 1 year

// Request validation schema
const ResolveAncillaryDataRequestSchema = ss.object({
  identifier: hexString(),
  time: positiveIntStr(),
  ancillaryData: hexString(),
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

  try {
    // Validate request query parameters
    const requestBody = validateQueryParams(
      req.query,
      ResolveAncillaryDataRequestSchema
    );
    // will throw if not resolved
    const result = await resolveAncillaryData({
      identifier: requestBody.identifier,
      time: BigNumber.from(requestBody.time),
      ancillaryData: requestBody.ancillaryData,
    });

    res.setHeader("Cache-Control", `public, max-age=${TTL}, s-maxage=${TTL}`);
    return res.status(200).json({
      resolvedAncillaryData: result.resolvedAncillaryData,
    });
  } catch (error) {
    return handleApiError(error, res);
  }
}
