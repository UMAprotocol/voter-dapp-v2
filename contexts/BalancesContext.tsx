import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useOutstandingRewards,
  useStakerDetails,
  useTokenAllowance,
  useUnstakedBalance,
  useUnstakeCoolDown,
} from "hooks";
import { createContext, ReactNode } from "react";

export interface BalancesContextState {
  stakedBalance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  outstandingRewards: BigNumber | undefined;
  tokenAllowance: BigNumber | undefined;
  unstakeRequestTime: Date | undefined;
  canUnstakeTime: Date | undefined;
  unstakeCoolDown: number | undefined;
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
  unstakeCoolDown: undefined,
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
  const {
    data: { unstakeCoolDown },
    isLoading: unstakeCoolDownLoading,
    isFetching: unstakeCoolDownFetching,
  } = useUnstakeCoolDown();

  function getBalancesLoading() {
    if (!address) return false;

    return (
      stakerDetailsLoading ||
      unstakedBalanceLoading ||
      outstandingRewardsLoading ||
      tokenAllowanceLoading ||
      unstakeCoolDownLoading
    );
  }

  function getBalancesFetching() {
    if (!address) return false;

    return (
      stakerDetailsFetching ||
      unstakedBalanceFetching ||
      outstandingRewardsFetching ||
      tokenAllowanceFetching ||
      unstakeCoolDownFetching
    );
  }

  return (
    <BalancesContext.Provider
      value={{
        stakedBalance,
        unstakedBalance,
        pendingUnstake,
        unstakeCoolDown,
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
