/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { constructContractOnChain } from "./_common";

async function generatePastRewardRetrievalTx(voterAddress: string) {
  const votingV1 = await constructContractOnChain(1, "Voting");

  const [voteRevealEvents, rewardsRetrievedEvents] = await Promise.all([
    votingV1.queryFilter(votingV1.filters.VoteRevealed(voterAddress)),
    votingV1.queryFilter(votingV1.filters.RewardsRetrieved(voterAddress)),
  ]);

  let filteredVoteRevealEvents = voteRevealEvents;
  rewardsRetrievedEvents.forEach((rewardsRetrieved) => {
    filteredVoteRevealEvents = filteredVoteRevealEvents.filter(
      (voteRevealed) =>
        !(
          voteRevealed?.args?.identifier ===
            rewardsRetrieved?.args?.identifier &&
          voteRevealed?.args?.time.toString() ===
            rewardsRetrieved?.args?.time.toString()
        )
    );
  });

  let revealsGroupedByRoundId: any = {};

  filteredVoteRevealEvents.forEach((voteRevealed) => {
    const roundId = voteRevealed?.args?.roundId.toString() || "";
    const voteProps = {
      identifier: voteRevealed?.args?.identifier,
      time: voteRevealed?.args?.time.toString(),
      ancillaryData: voteRevealed?.args?.ancillaryData,
    };

    if (!revealsGroupedByRoundId || !revealsGroupedByRoundId[roundId])
      revealsGroupedByRoundId[roundId] = [voteProps];
    else revealsGroupedByRoundId[roundId].push(voteProps);
  });

  return await constructMultiCallPayload(revealsGroupedByRoundId, voterAddress);
}

async function constructMultiCallPayload(
  unclaimedVotes: {
    [roundId: string]: [
      { identifier: string; time: string; ancillaryData: string }
    ];
  },
  voterAddress: string
) {
  const votingV2 = await constructContractOnChain(5, "VotingV2");
  const retrieveFragment = votingV2.interface.getFunction(
    "retrieveRewardsOnMigratedVotingContract(address,uint256,(bytes32,uint256,bytes)[])"
  );

  let multiCallPayload = "";

  Object.keys(unclaimedVotes).forEach((roundId) => {
    multiCallPayload += votingV2.interface.encodeFunctionData(
      retrieveFragment,
      [voterAddress, roundId, unclaimedVotes[roundId]]
    );
  });
  return multiCallPayload;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body = request.body;
    ["account"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw "Missing key in req body! required: account";
    });
    const multiCallTxData = await generatePastRewardRetrievalTx(body.account);
    response.status(200).send(multiCallTxData);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in generating multiCall tx",
      error: e instanceof Error ? e.message : e,
    });
  }
}
