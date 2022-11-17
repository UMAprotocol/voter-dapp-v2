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
  const currentTimeMs = BigNumber.from(Math.floor(Date.now()));

  const rewardPerToken = cumulativeStake.eq(0)
    ? rewardPerTokenStored
    : rewardPerTokenStored
        .mul(1000)
        .add(
          currentTimeMs
            .sub(lastUpdateTime.mul(1000))
            .mul(emissionRate.mul(1000))
            .mul(oneEth)
            .div(cumulativeStake)
        );

  const result = outstandingRewardsFromContract.add(
    stakedBalance
      .mul(rewardPerToken.sub(rewardsPaidPerToken.mul(1000)))
      .div(oneEth.mul(10))
  );

  console.log(
    result.toString(),
    outstandingRewardsFromContract.toString(),
    result.eq(outstandingRewardsFromContract)
  );

  return result;
}
