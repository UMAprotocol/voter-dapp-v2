import { BigNumber } from "ethers";
import { calculateOutstandingRewards } from "helpers";
import {
  useAccountDetails,
  useInterval,
  useOutstandingRewards,
  useRewardsCalculationInputs,
  useStakedBalance,
  useStakerDetails,
  useTokenAllowance,
  useUnstakeCoolDown,
  useUnstakedBalance,
  useV1Rewards,
  useDelegatorStakedBalance,
} from "hooks";
import { createContext, ReactNode, useState } from "react";
import { V1RewardsT } from "types";

export interface StakingContextState {
  stakedBalance: BigNumber | undefined;
  delegatorStakedBalance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  updateTime: BigNumber | undefined;
  outstandingRewards: BigNumber | undefined;
  tokenAllowance: BigNumber | undefined;
  unstakeRequestTime: Date | undefined;
  canUnstakeTime: Date | undefined;
  unstakeCoolDown: BigNumber | undefined;
  v1Rewards: V1RewardsT | undefined;
  resetOutstandingRewards: () => void;
  getStakingDataLoading: () => boolean;
  getStakingDataFetching: () => boolean;
}

export const defaultStakingContextState: StakingContextState = {
  stakedBalance: undefined,
  delegatorStakedBalance: undefined,
  unstakedBalance: undefined,
  pendingUnstake: undefined,
  updateTime: undefined,
  outstandingRewards: undefined,
  tokenAllowance: undefined,
  unstakeRequestTime: undefined,
  canUnstakeTime: undefined,
  unstakeCoolDown: undefined,
  resetOutstandingRewards: () => null,
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
      pendingUnstake,
      unstakeRequestTime,
      canUnstakeTime,
      rewardsPaidPerToken,
    },
    isLoading: stakerDetailsLoading,
    isFetching: stakerDetailsFetching,
  } = useStakerDetails();
  const {
    data: stakedBalance,
    isLoading: stakedBalanceLoading,
    isFetching: stakedBalanceFetching,
  } = useStakedBalance();
  const {
    data: delegatorStakedBalance,
    isLoading: delegatorStakedBalanceLoading,
    isFetching: delegatorStakedBalanceFetching,
  } = useDelegatorStakedBalance();
  const {
    data: unstakedBalance,
    isLoading: unstakedBalanceLoading,
    isFetching: unstakedBalanceFetching,
  } = useUnstakedBalance();
  const {
    data: { emissionRate, rewardPerTokenStored, cumulativeStake, updateTime },
    isLoading: rewardsCalculationInputsLoading,
    isFetching: rewardsCalculationInputsFetching,
  } = useRewardsCalculationInputs();
  const {
    data: outstandingRewardsFromContract,
    isLoading: outstandingRewardsLoading,
    isFetching: outstandingRewardsFetching,
  } = useOutstandingRewards();
  const {
    data: tokenAllowance,
    isLoading: tokenAllowanceLoading,
    isFetching: tokenAllowanceFetching,
  } = useTokenAllowance();
  const { address } = useAccountDetails();
  const {
    data: unstakeCoolDown,
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
      outstandingRewardsFromContract,
      stakedBalance,
      rewardsPaidPerToken,
      cumulativeStake,
      rewardPerTokenStored,
      updateTime,
      emissionRate,
    });

    setOutstandingRewards(calculatedOutstandingRewards);
  }

  function resetOutstandingRewards() {
    setOutstandingRewards(BigNumber.from(0));
  }

  function getStakingDataLoading() {
    if (!address) return false;

    return (
      stakerDetailsLoading ||
      stakedBalanceLoading ||
      unstakedBalanceLoading ||
      outstandingRewardsLoading ||
      tokenAllowanceLoading ||
      unstakeCoolDownLoading ||
      rewardsCalculationInputsLoading ||
      delegatorStakedBalanceLoading
    );
  }

  function getStakingDataFetching() {
    if (!address) return false;

    return (
      stakerDetailsFetching ||
      stakedBalanceFetching ||
      unstakedBalanceFetching ||
      outstandingRewardsFetching ||
      tokenAllowanceFetching ||
      unstakeCoolDownFetching ||
      rewardsCalculationInputsFetching ||
      delegatorStakedBalanceFetching
    );
  }

  return (
    <StakingContext.Provider
      value={{
        stakedBalance,
        delegatorStakedBalance,
        unstakedBalance,
        pendingUnstake,
        unstakeCoolDown,
        outstandingRewards,
        tokenAllowance,
        unstakeRequestTime,
        canUnstakeTime,
        resetOutstandingRewards,
        v1Rewards,
        getStakingDataLoading,
        getStakingDataFetching,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}
