import { BigNumber, Contract, utils } from "ethers";
import { getProvider } from "helpers/config";
import { hexString } from "helpers/validators";
import {
  parsePolymarketV2AncillaryData,
  polymarketV2Reporter,
  polymarketV2ManagedOracle,
} from "lib/polymarket-v2";
import type { NextApiRequest, NextApiResponse } from "next";
import * as s from "superstruct";
import { handleApiError, HttpError } from "./_utils/errors";
import { validateBodyParams } from "./_utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "64kb" } } };
const bodySchema = s.type({
  identifier: s.enums(["YES_OR_NO_QUERY", "NUMERICAL"]),
  ancillaryData: hexString(),
});
const managedOracleAbi = [
  "function getRequestRulesUpdates(address requester, bytes32 identifier, bytes ancillaryData) view returns (tuple(uint256 timestamp, bytes updatedRules)[])",
];

type RulesOracle = Contract & {
  getRequestRulesUpdates(
    requester: string,
    identifier: string,
    ancillaryData: string,
    overrides: { blockTag: number }
  ): Promise<Array<{ timestamp: BigNumber; updatedRules: string }>>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const body = validateBodyParams(req.body, bodySchema);
    let decoded: string;
    try {
      decoded = utils.toUtf8String(body.ancillaryData);
    } catch {
      throw new HttpError({ statusCode: 400, msg: "Invalid ancillary data" });
    }
    const v2 = parsePolymarketV2AncillaryData(decoded);
    if (!v2)
      throw new HttpError({
        statusCode: 400,
        msg: "Not a canonical Polymarket V2 request",
      });

    const provider = getProvider(137);
    const block = await provider.getBlock("finalized");
    if (!block) throw new Error("Finalized block unavailable");
    const oracle = new Contract(
      polymarketV2ManagedOracle,
      managedOracleAbi,
      provider
    ) as RulesOracle;
    // Managed OO stores history by (requester, identifier, original rules), without
    // a timestamp. This includes updates across re-requests and reporter aliases.
    const updates = await oracle.getRequestRulesUpdates(
      polymarketV2Reporter,
      utils.formatBytes32String(body.identifier),
      utils.hexlify(utils.toUtf8Bytes(v2.rawRules)),
      { blockTag: block.number }
    );
    const bulletins = updates.map(({ timestamp, updatedRules }) => ({
      timestamp: timestamp.toNumber(),
      update: utils.toUtf8String(updatedRules),
    }));
    res.status(200).json({ bulletins });
  } catch (error) {
    // Provider errors can contain RPC credentials; expose only a fixed message.
    handleApiError(
      error instanceof HttpError
        ? error
        : new HttpError({
            statusCode: 503,
            msg: "Unable to read Polymarket V2 rule updates. Please retry.",
          }),
      res
    );
  }
}
