import { VotingEthers } from "@uma/contracts-frontend";
import { NextApiRequest, NextApiResponse } from "next";
import { MainnetOrGoerli } from "types";
import { constructContractOnChain } from "./_common";

type GroupedReveals = Record<
  string,
  { identifier: string; time: string; ancillaryData: string }[]
>;

async function generatePastRewardTx(
  voterAddress: string,
  chainId: MainnetOrGoerli
) {
  const votingV1 = (await constructContractOnChain(
    chainId,
    "Voting"
  )) as VotingEthers;

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

  const groupedReveals: GroupedReveals = {};

  filteredVoteRevealEvents.forEach((voteRevealed) => {
    const roundId = voteRevealed?.args?.roundId.toString() || "";
    const voteProps = {
      identifier: voteRevealed?.args?.identifier,
      time: voteRevealed?.args?.time.toString(),
      ancillaryData: voteRevealed?.args?.ancillaryData,
    };

    if (!groupedReveals[roundId]) groupedReveals[roundId] = [voteProps];
    else groupedReveals[roundId].push(voteProps);
  });

  if (Object.keys(groupedReveals).length === 0) return [];

  return await constructMultiCall(groupedReveals, voterAddress, chainId);
}

async function constructMultiCall(
  unclaimedVotes: GroupedReveals,
  voterAddress: string,
  chainId: MainnetOrGoerli
) {
  const votingV2 = await constructContractOnChain(chainId, "VotingV2");
  const retrieveFragment = votingV2.interface.getFunction(
    "retrieveRewardsOnMigratedVotingContract(address,uint256,(bytes32,uint256,bytes)[])"
  );

  const multiCallPayload: string[] = [];

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
    const body = request.body as {
      address: string;
      chainId: MainnetOrGoerli;
    };
    ["address", "chainId"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw `Missing key in req body! required: ${requiredKey}`;
    });
    const multiCallTx = await generatePastRewardTx(body.address, body.chainId);
    response.status(200).send(multiCallTx);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in generating multiCall tx",
      error: e instanceof Error ? e.message : e,
    });
  }
}
