import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export async function getRewardsCalculationInputs(voting: VotingV2Ethers) {
  const emissionRate = await voting.emissionRate();
  const rewardPerTokenStored = await voting.rewardPerTokenStored();
  const cumulativeStake = await voting.cumulativeStake();
  const updateTime = BigNumber.from(Date.now());

  return {
    emissionRate,
    rewardPerTokenStored,
    cumulativeStake,
    updateTime,
  };
}
