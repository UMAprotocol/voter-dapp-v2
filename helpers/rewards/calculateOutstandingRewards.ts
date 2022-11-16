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
  const currentTime = BigNumber.from(Math.floor(Date.now() / 1000));

  const rewardPerToken = cumulativeStake.eq(0)
    ? rewardPerTokenStored
    : rewardPerTokenStored.add(
        currentTime
          .sub(lastUpdateTime)
          .mul(emissionRate)
          .mul(oneEth)
          .div(cumulativeStake)
      );

  return outstandingRewardsFromContract.add(
    stakedBalance.mul(rewardPerToken.sub(rewardsPaidPerToken)).div(oneEth)
  );
}
