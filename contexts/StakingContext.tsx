import { BigNumber } from "ethers";
import { calculateOutstandingRewards } from "helpers";
import {
  useAccountDetails,
  useInterval,
  useRewardsCalculationInputs,
  useStakerDetails,
  useTokenAllowance,
  useUnstakeCoolDown,
  useUnstakedBalance,
} from "hooks";
import { useV1Rewards } from "hooks/queries/rewards/useV1Rewards";
import { createContext, ReactNode, useState } from "react";
import { V1RewardsT } from "types";

export interface StakingContextState {
  stakedBalance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  outstandingRewards: BigNumber | undefined;
  tokenAllowance: BigNumber | undefined;
  unstakeRequestTime: Date | undefined;
  canUnstakeTime: Date | undefined;
  unstakeCoolDown: number | undefined;
  v1Rewards: V1RewardsT | undefined;
  getStakingDataLoading: () => boolean;
  getStakingDataFetching: () => boolean;
}

export const defaultStakingContextState: StakingContextState = {
  stakedBalance: undefined,
  unstakedBalance: undefined,
  pendingUnstake: undefined,
  outstandingRewards: undefined,
  tokenAllowance: undefined,
  unstakeRequestTime: undefined,
  canUnstakeTime: undefined,
  unstakeCoolDown: undefined,
  v1Rewards: undefined,
  getStakingDataLoading: () => false,
  getStakingDataFetching: () => false,
};

export const StakingContext = createContext<StakingContextState>(
  defaultStakingContextState
);

export function StakingProvider({ children }: { children: ReactNode }) {
  const {
    data: {
      stakedBalance,
      pendingUnstake,
      unstakeRequestTime,
      canUnstakeTime,
      rewardsPaidPerToken,
    },
    isLoading: stakerDetailsLoading,
    isFetching: stakerDetailsFetching,
  } = useStakerDetails();
  const {
    data: unstakedBalance,
    isLoading: unstakedBalanceLoading,
    isFetching: unstakedBalanceFetching,
  } = useUnstakedBalance();
  const {
    data: {
      emissionRate,
      rewardPerTokenStored,
      lastUpdateTime,
      cumulativeStake,
    },
    isLoading: rewardsCalculationInputsLoading,
    isFetching: rewardsCalculationInputsFetching,
  } = useRewardsCalculationInputs();
  const {
    data: tokenAllowance,
    isLoading: tokenAllowanceLoading,
    isFetching: tokenAllowanceFetching,
  } = useTokenAllowance();
  const { address } = useAccountDetails();
  const {
    data: { unstakeCoolDown },
    isLoading: unstakeCoolDownLoading,
    isFetching: unstakeCoolDownFetching,
  } = useUnstakeCoolDown();
  const { data: v1Rewards } = useV1Rewards();
  const [outstandingRewards, setOutstandingRewards] = useState(
    BigNumber.from(0)
  );

  useInterval(() => {
    updateOutstandingRewards();
  }, 100);

  function updateOutstandingRewards() {
    const calculatedOutstandingRewards = calculateOutstandingRewards({
      stakedBalance,
      rewardsPaidPerToken,
      cumulativeStake,
      rewardPerTokenStored,
      lastUpdateTime,
      emissionRate,
    });

    setOutstandingRewards(calculatedOutstandingRewards);
  }

  function getStakingDataLoading() {
    if (!address) return false;

    return (
      stakerDetailsLoading ||
      unstakedBalanceLoading ||
      tokenAllowanceLoading ||
      unstakeCoolDownLoading ||
      rewardsCalculationInputsLoading
    );
  }

  function getStakingDataFetching() {
    if (!address) return false;

    return (
      stakerDetailsFetching ||
      unstakedBalanceFetching ||
      tokenAllowanceFetching ||
      unstakeCoolDownFetching ||
      rewardsCalculationInputsFetching
    );
  }

  return (
    <StakingContext.Provider
      value={{
        stakedBalance,
        unstakedBalance,
        pendingUnstake,
        unstakeCoolDown,
        outstandingRewards,
        tokenAllowance,
        unstakeRequestTime,
        canUnstakeTime,
        v1Rewards,
        getStakingDataLoading,
        getStakingDataFetching,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}
