import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { BigNumber } from "ethers";
import {
  hasL2AncillaryDataStamp,
  resolveAncillaryData,
} from "lib/l2-ancillary-data";
import { decodeHexString } from "helpers/web3/decodeHexString";
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
    const result = await resolveAncillaryData({
      identifier: requestBody.identifier,
      time: BigNumber.from(requestBody.time),
      ancillaryData: requestBody.ancillaryData,
    });

    // the resolver falls back to the original (still-stamped) value when the
    // child-chain lookup fails — that must be an uncached error, or the CDN
    // pins the failure for a year and clients can never resolve this request
    if (hasL2AncillaryDataStamp(decodeHexString(result.resolvedAncillaryData))) {
      res.setHeader("Cache-Control", "no-store");
      return res
        .status(502)
        .json({ error: "Unable to resolve L2 ancillary data" });
    }

    res.setHeader("Cache-Control", `public, max-age=${TTL}, s-maxage=${TTL}`);
    return res.status(200).json({
      resolvedAncillaryData: result.resolvedAncillaryData,
    });
  } catch (error) {
    return handleApiError(error, res);
  }
}
