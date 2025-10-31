/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";

import { constructContract } from "./_common";
import { handleApiError } from "./_utils/errors";

async function warmAugmentedDataCache(req: NextApiRequest) {
  const votingV1 = await constructContract(1, "Voting");
  // todo: add voting v2 when released.
  // const votingV2 = await constructContract(1, "VotingV2");
  const l1RequestEvents = (
    await Promise.all([
      votingV1.queryFilter(votingV1.filters.PriceRequestAdded()),
      // votingV2.queryFilter(votingV2.filters.RequestAdded())
    ])
  ).flat();

  const warmingPayload = l1RequestEvents.map((l1RequestEvent) => {
    return {
      identifier: l1RequestEvent?.args?.identifier,
      time: Number(l1RequestEvent?.args?.time),
    };
  });

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const rawResponse = await fetch(`${protocol}://${host}/api/augment-request`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ l1Requests: warmingPayload }),
  });

  await rawResponse.json();
}

async function warmCache(req: NextApiRequest) {
  await warmAugmentedDataCache(req);
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    await warmCache(request);

    response.status(200).send("done");
  } catch (error) {
    return handleApiError(error, response);
  }
}
