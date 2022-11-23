/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { constructContractOnChain } from "./_common";

async function generatePastRewardTx(voterAddress: string, chainId: number) {
  const votingV1 = await constructContractOnChain(chainId, "Voting");

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

  const groupedReveals: any = {};

  filteredVoteRevealEvents.forEach((voteRevealed) => {
    const roundId = voteRevealed?.args?.roundId.toString() || "";
    const voteProps = {
      identifier: voteRevealed?.args?.identifier,
      time: voteRevealed?.args?.time.toString(),
      ancillaryData: voteRevealed?.args?.ancillaryData,
    };

    if (!groupedReveals || !groupedReveals[roundId])
      groupedReveals[roundId] = [voteProps];
    else groupedReveals[roundId].push(voteProps);
  });

  return await constructMultiCall(groupedReveals, voterAddress, chainId);
}

async function constructMultiCall(
  unclaimedVotes: {
    [roundId: string]: [
      { identifier: string; time: string; ancillaryData: string }
    ];
  },
  voterAddress: string,
  chainId: number
) {
  const votingV2 = await constructContractOnChain(chainId, "VotingV2");
  const retrieveFragment = votingV2.interface.getFunction(
    "retrieveRewardsOnMigratedVotingContract(address,uint256,(bytes32,uint256,bytes)[])"
  );

  let multiCallPayload: any = [];

  Object.keys(unclaimedVotes).forEach((roundId) => {
    multiCallPayload.push(
      votingV2.interface.encodeFunctionData(retrieveFragment, [
        voterAddress,
        roundId,
        unclaimedVotes[roundId],
      ])
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
    ["account", "chainId"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw "Missing key in req body! required: account";
    });
    const multiCallTx = await generatePastRewardTx(body.account, body.chainId);
    response.status(200).send(multiCallTx);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in generating multiCall tx",
      error: e instanceof Error ? e.message : e,
    });
  }
}
