import { BigNumber } from "ethers";
import { oneEth } from "helpers/web3/ethers";

interface CalculationInputs {
  voterOutstandingRewards: BigNumber;
  stakedBalance: BigNumber;
  rewardsPaidPerToken: BigNumber;
  cumulativeStake: BigNumber;
  rewardPerTokenStored: BigNumber;
  updateTime: BigNumber;
  emissionRate: BigNumber;
}
export function calculateOutstandingRewards({
  voterOutstandingRewards,
  stakedBalance,
  rewardsPaidPerToken,
  cumulativeStake,
  rewardPerTokenStored,
  updateTime,
  emissionRate,
}: CalculationInputs) {
  const currentTimeMs = BigNumber.from(Date.now());
  const deltaTimeMs = currentTimeMs.sub(updateTime);
  const emissionRateMs = emissionRate.div(1000);
  const rewardPerToken = cumulativeStake.eq(0)
    ? rewardPerTokenStored
    : rewardPerTokenStored.add(
        deltaTimeMs.mul(emissionRateMs).mul(oneEth).div(cumulativeStake)
      );

  const rewardsFromLoad = stakedBalance
    .mul(rewardPerToken.sub(rewardsPaidPerToken))
    .div(oneEth);

  return voterOutstandingRewards.add(rewardsFromLoad);
}
