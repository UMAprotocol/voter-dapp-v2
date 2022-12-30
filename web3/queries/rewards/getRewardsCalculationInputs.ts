import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export async function getRewardsCalculationInputs(voting: VotingV2Ethers) {
  const [emissionRate, rewardPerTokenStored, cumulativeStake, updateTime] =
    await Promise.all([
      voting.emissionRate(),
      voting.rewardPerTokenStored(),
      voting.cumulativeStake(),
      BigNumber.from(Date.now()),
    ]);

  return {
    emissionRate,
    rewardPerTokenStored,
    cumulativeStake,
    updateTime,
  };
}
