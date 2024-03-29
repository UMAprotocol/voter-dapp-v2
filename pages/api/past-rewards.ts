import { VotingEthers, VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber, ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { MainnetOrL1Testnet } from "types";
import { constructContract } from "./_common";

type GroupedReveals = Record<
  string,
  { identifier: string; time: string; ancillaryData: string }[]
>;

async function generatePastRewardTx(
  voterAddress: string,
  chainId: MainnetOrL1Testnet
): Promise<{ multicallPayload: string[]; totalRewards: string }> {
  const votingV1 = (await constructContract(chainId, "Voting")) as VotingEthers;

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

  if (Object.keys(groupedReveals).length === 0)
    return { multicallPayload: [], totalRewards: "0" };

  return constructMulticall(groupedReveals, voterAddress, chainId);
}

async function constructMulticall(
  unclaimedVotes: GroupedReveals,
  voterAddress: string,
  chainId: MainnetOrL1Testnet
): Promise<{ multicallPayload: string[]; totalRewards: string }> {
  const votingV2 = (await constructContract(
    chainId,
    "VotingV2"
  )) as VotingV2Ethers;
  const retrieveFragment = votingV2.interface.getFunction(
    "retrieveRewardsOnMigratedVotingContract(address,uint256,(bytes32,uint256,bytes)[])"
  );

  const multicallPayload: string[] = [];

  Object.keys(unclaimedVotes).forEach((roundId) => {
    multicallPayload.push(
      // @ts-expect-error - ethers types are incorrect for this function.
      votingV2.interface.encodeFunctionData(retrieveFragment, [
        voterAddress,
        roundId,
        unclaimedVotes[roundId],
      ])
    );
  });

  try {
    const totalRewards = (await votingV2.callStatic.multicall(multicallPayload))
      .map((reward: string) => ethers.BigNumber.from(reward))
      .reduce(
        (a: BigNumber, b: BigNumber) => a.add(b),
        ethers.BigNumber.from(0)
      )
      .toString();
    return { multicallPayload, totalRewards };
  } catch (error) {
    return { multicallPayload: [], totalRewards: "0" };
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.
  try {
    const body = request.body as {
      address: string;
      chainId: MainnetOrL1Testnet;
    };
    ["address", "chainId"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw `Missing key in req body! required: ${requiredKey}`;
    });
    const { address, chainId } = body;
    const multicallTx = await generatePastRewardTx(address, chainId);
    response.status(200).send(multicallTx);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in generating multicall tx",
      error: e instanceof Error ? e.message : e,
    });
  }
}
