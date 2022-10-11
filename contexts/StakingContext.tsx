import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useOutstandingRewards,
  useStakerDetails,
  useTokenAllowance,
  useUnstakedBalance,
} from "hooks";
import { createContext, ReactNode } from "react";

export interface StakingContextState {
  stakedBalance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  outstandingRewards: BigNumber | undefined;
  tokenAllowance: BigNumber | undefined;
  unstakeRequestTime: Date | undefined;
  canUnstakeTime: Date | undefined;
  delegate: string | undefined;
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
  delegate: undefined,
  getStakingDataLoading: () => false,
  getStakingDataFetching: () => false,
};

export const StakingContext = createContext<StakingContextState>(defaultStakingContextState);

export function BalancesProvider({ children }: { children: ReactNode }) {
  const {
    data: { stakedBalance, pendingUnstake, unstakeRequestTime, canUnstakeTime, delegate },
    isLoading: stakerDetailsLoading,
    isFetching: stakerDetailsFetching,
  } = useStakerDetails();
  const {
    data: unstakedBalance,
    isLoading: unstakedBalanceLoading,
    isFetching: unstakedBalanceFetching,
  } = useUnstakedBalance();
  const {
    data: outstandingRewards,
    isLoading: outstandingRewardsLoading,
    isFetching: outstandingRewardsFetching,
  } = useOutstandingRewards();
  const {
    data: tokenAllowance,
    isLoading: tokenAllowanceLoading,
    isFetching: tokenAllowanceFetching,
  } = useTokenAllowance();
  const { address } = useAccountDetails();

  function getStakingDataLoading() {
    if (!address) return false;

    return stakerDetailsLoading || unstakedBalanceLoading || outstandingRewardsLoading || tokenAllowanceLoading;
  }

  function getStakingDataFetching() {
    if (!address) return false;

    return stakerDetailsFetching || unstakedBalanceFetching || outstandingRewardsFetching || tokenAllowanceFetching;
  }

  return (
    <StakingContext.Provider
      value={{
        stakedBalance,
        unstakedBalance,
        pendingUnstake,
        outstandingRewards,
        tokenAllowance,
        unstakeRequestTime,
        canUnstakeTime,
        delegate,
        getStakingDataLoading,
        getStakingDataFetching,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}
