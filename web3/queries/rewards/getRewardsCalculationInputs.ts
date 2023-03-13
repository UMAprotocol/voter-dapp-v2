import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getRewardsCalculationInputs(voting: VotingV2Ethers) {
  const [
    emissionRate,
    rewardPerTokenStored,
    cumulativeStake,
    updateTimeSeconds,
  ] = await Promise.all([
    voting.emissionRate(),
    voting.rewardPerTokenStored(),
    voting.cumulativeStake(),
    voting.lastUpdateTime(),
  ]);

  return {
    emissionRate,
    rewardPerTokenStored,
    cumulativeStake,
    updateTimeSeconds,
    updateTime: updateTimeSeconds.mul(1000),
  };
}
