import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useOutstandingRewards,
  useStakerDetails,
  useTokenAllowance,
  useUnstakedBalance,
} from "hooks";
import { createContext, ReactNode } from "react";

interface BalancesContextState {
  stakedBalance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  outstandingRewards: BigNumber | undefined;
  tokenAllowance: BigNumber | undefined;
  unstakeRequestTime: Date | undefined;
  canUnstakeTime: Date | undefined;
  getBalancesLoading: () => boolean;
  getBalancesFetching: () => boolean;
}

export const defaultBalancesContextState: BalancesContextState = {
  stakedBalance: undefined,
  unstakedBalance: undefined,
  pendingUnstake: undefined,
  outstandingRewards: undefined,
  tokenAllowance: undefined,
  unstakeRequestTime: undefined,
  canUnstakeTime: undefined,
  getBalancesLoading: () => false,
  getBalancesFetching: () => false,
};

export const BalancesContext = createContext<BalancesContextState>(defaultBalancesContextState);

export function BalancesProvider({ children }: { children: ReactNode }) {
  const {
    data: { stakedBalance, pendingUnstake, unstakeRequestTime, canUnstakeTime },
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

  function getBalancesLoading() {
    if (!address) return false;

    return stakerDetailsLoading || unstakedBalanceLoading || outstandingRewardsLoading || tokenAllowanceLoading;
  }

  function getBalancesFetching() {
    if (!address) return false;

    return stakerDetailsFetching || unstakedBalanceFetching || outstandingRewardsFetching || tokenAllowanceFetching;
  }

  return (
    <BalancesContext.Provider
      value={{
        stakedBalance,
        unstakedBalance,
        pendingUnstake,
        outstandingRewards,
        tokenAllowance,
        unstakeRequestTime,
        canUnstakeTime,
        getBalancesLoading,
        getBalancesFetching,
      }}
    >
      {children}
    </BalancesContext.Provider>
  );
}
