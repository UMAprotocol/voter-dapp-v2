import { BigNumber } from "ethers";
import { oneEth } from "helpers/web3/ethers";

interface CalculationInputs {
  outstandingRewardsFromContract: BigNumber;
  stakedBalance: BigNumber;
  rewardsPaidPerToken: BigNumber;
  cumulativeStake: BigNumber;
  rewardPerTokenStored: BigNumber;
  lastUpdateTime: BigNumber;
  emissionRate: BigNumber;
}
export function calculateOutstandingRewards({
  outstandingRewardsFromContract,
  stakedBalance,
  rewardsPaidPerToken,
  cumulativeStake,
  rewardPerTokenStored,
  lastUpdateTime,
  emissionRate,
}: CalculationInputs) {
  const currentTimeMs = BigNumber.from(Date.now());
  const deltaTimeMs = currentTimeMs.sub(lastUpdateTime.mul(1000));
  const emissionRateMs = emissionRate.div(1000);

  const rewardPerToken = cumulativeStake.eq(0)
    ? rewardPerTokenStored
    : rewardPerTokenStored.add(
        deltaTimeMs.mul(emissionRateMs).mul(oneEth).div(cumulativeStake)
      );

  return stakedBalance.mul(rewardPerToken.sub(rewardsPaidPerToken)).div(oneEth);
}
