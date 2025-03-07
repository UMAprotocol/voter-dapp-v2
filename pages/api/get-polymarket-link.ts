import { hexString } from "helpers/validators";
import { NextApiRequest, NextApiResponse } from "next";
import { type, create } from "superstruct";
import { getProviderByChainId, HttpError } from "./_common";
import { utils } from "ethers";

// event ConditionPreparation
const topicHash =
  "0xab3760c3bd2bb38b5bcf54dc79802ed67338b4cf29f3054ded67ed24661e4177";
const provider = getProviderByChainId(137);

const querySchema = type({
  txHash: hexString(),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const query = create(request.query, querySchema);
    const hash = query?.txHash;
    if (!hash) {
      throw new HttpError({
        status: 400,
        message: "Invalid Param: txHash must be valid hex string",
      });
    }

    const tx = await provider.getTransactionReceipt(hash);

    const log = tx.logs.find((log) => log.topics?.[0] === topicHash);

    if (!log) {
      throw new HttpError({
        status: 404,
        message: "Log not found: Unable to find link for this tx hash",
      });
    }

    const conditionId = utils.hexlify(log.topics[1]);
    const data = (await fetch(
      `https://gamma-api.polymarket.com/markets?condition_ids=${conditionId}`
    ).then((res) => res.json())) as Array<{ slug: string }>;

    const slug = data?.[0]?.slug;

    if (!slug) {
      throw new HttpError({
        status: 404,
        message: "Log not found: Unable to find link for this tx hash",
      });
    }

    response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000");
    response.status(200).send({ slug });
  } catch (e) {
    console.error(e);

    response.status(e instanceof HttpError ? e.status : 500).send({
      message: "Server error",
      error: e instanceof Error ? e.message : e,
    });
  }
}
