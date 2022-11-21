import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getRewardsCalculationInputs(voting: VotingV2Ethers) {
  const emissionRate = await voting.emissionRate();
  const rewardPerTokenStored = await voting.rewardPerTokenStored();
  const lastUpdateTime = await voting.lastUpdateTime();
  const cumulativeStake = await voting.cumulativeStake();

  return {
    emissionRate,
    rewardPerTokenStored,
    lastUpdateTime,
    cumulativeStake,
  };
}
