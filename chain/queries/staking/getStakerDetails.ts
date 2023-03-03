import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getStakerDetails(
  votingContract: VotingV2Ethers,
  address: string
) {
  const result = await votingContract.voterStakes(address);
  const { pendingUnstake, unstakeTime, delegate, rewardsPaidPerToken } =
    result ?? {};
  const canUnstakeTime = new Date(Number(unstakeTime) * 1000);

  return {
    pendingUnstake,
    canUnstakeTime,
    delegate,
    rewardsPaidPerToken,
  };
}
