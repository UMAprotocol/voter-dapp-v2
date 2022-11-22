/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";

import { constructContractOnChain } from "./_common";

async function warmAugmentedDataCache() {
  const votingV1 = await constructContractOnChain(1, "Voting");
  // todo: add voting v2 when released.
  // const votingV2 = await constructContractOnChain(1, "VotingV2");
  const l1RequestEvents = (
    await Promise.all([
      votingV1.queryFilter(votingV1.filters.PriceRequestAdded()),
      // votingV2.queryFilter(votingV2.filters.PriceRequestAdded())
    ])
  ).flat();

  const warmingPayload = l1RequestEvents.map((l1RequestEvent) => {
    return {
      identifier: l1RequestEvent?.args?.identifier,
      time: Number(l1RequestEvent?.args?.time),
    };
  });

  const rawResponse = await fetch(
    `${process.env.DEPLOYMENT_URL}/api/augment-request`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ l1Requests: warmingPayload }),
    }
  );

  await rawResponse.json();
}

async function warmCache() {
  await warmAugmentedDataCache();
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    await warmCache();

    response.status(200).send("done");
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in decoding admin call",
      error: e instanceof Error ? e.message : e,
    });
  }
}
