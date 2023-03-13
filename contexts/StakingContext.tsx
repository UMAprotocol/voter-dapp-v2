import { BigNumber } from "ethers";
import { calculateOutstandingRewards } from "helpers";
import {
  useAccountDetails,
  useInterval,
  useRewardsCalculationInputs,
  useStakedBalance,
  useStakerDetails,
  useTokenAllowance,
  useUnstakeCoolDown,
  useUnstakedBalance,
  useV1Rewards,
} from "hooks";
import { useIsOldDesignatedVotingAccount } from "hooks/queries/rewards/useIsOldDesignatedVotingAccount";
import { createContext, ReactNode, useState } from "react";
import { OldDesignatedVotingAccountT, V1RewardsT } from "types";

export interface StakingContextState {
  stakedBalance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  updateTime: BigNumber | undefined;
  outstandingRewards: BigNumber | undefined;
  tokenAllowance: BigNumber | undefined;
  canUnstakeTime: Date | undefined;
  unstakeCoolDown: BigNumber | undefined;
  v1Rewards: V1RewardsT | undefined;
  oldDesignatedVotingAccount: OldDesignatedVotingAccountT;
  getStakingDataLoading: () => boolean;
  getStakingDataFetching: () => boolean;
  setAddressOverride: (address?: string) => void;
}

export const defaultStakingContextState: StakingContextState = {
  stakedBalance: undefined,
  unstakedBalance: undefined,
  pendingUnstake: undefined,
  updateTime: undefined,
  outstandingRewards: undefined,
  tokenAllowance: undefined,
  canUnstakeTime: undefined,
  unstakeCoolDown: undefined,
  v1Rewards: undefined,
  oldDesignatedVotingAccount: {
    isOldDesignatedVotingAccount: false,
    message: "",
    designatedVotingContract: "",
  },
  getStakingDataLoading: () => false,
  getStakingDataFetching: () => false,
  setAddressOverride: () => undefined,
};

export const StakingContext = createContext<StakingContextState>(
  defaultStakingContextState
);

export function StakingProvider({ children }: { children: ReactNode }) {
  const { address: defaultAddress } = useAccountDetails();
  const [addressOverride, setAddressOverride] = useState<string | undefined>(
    undefined
  );
  const address = addressOverride || defaultAddress;

  const {
    data: {
      pendingUnstake,
      canUnstakeTime,
      rewardsPaidPerToken,
      outstandingRewards: voterOutstandingRewards,
    },
    isLoading: stakerDetailsLoading,
    isFetching: stakerDetailsFetching,
  } = useStakerDetails(address);
  const {
    data: stakedBalance,
    isLoading: stakedBalanceLoading,
    isFetching: stakedBalanceFetching,
  } = useStakedBalance(address);
  const {
    data: unstakedBalance,
    isLoading: unstakedBalanceLoading,
    isFetching: unstakedBalanceFetching,
  } = useUnstakedBalance(address);
  const {
    data: { emissionRate, rewardPerTokenStored, cumulativeStake, updateTime },
    isLoading: rewardsCalculationInputsLoading,
    isFetching: rewardsCalculationInputsFetching,
  } = useRewardsCalculationInputs(address);
  const {
    data: tokenAllowance,
    isLoading: tokenAllowanceLoading,
    isFetching: tokenAllowanceFetching,
  } = useTokenAllowance();
  const {
    data: unstakeCoolDown,
    isLoading: unstakeCoolDownLoading,
    isFetching: unstakeCoolDownFetching,
  } = useUnstakeCoolDown();
  const { data: v1Rewards } = useV1Rewards();
  const [outstandingRewards, setOutstandingRewards] = useState(
    BigNumber.from(0)
  );
  const { data: oldDesignatedVotingAccount } =
    useIsOldDesignatedVotingAccount();

  useInterval(() => {
    updateOutstandingRewards();
  }, 100);

  function updateOutstandingRewards() {
    const calculatedOutstandingRewards = calculateOutstandingRewards({
      voterOutstandingRewards,
      stakedBalance,
      rewardsPaidPerToken,
      cumulativeStake,
      rewardPerTokenStored,
      updateTime,
      emissionRate,
    });

    setOutstandingRewards(calculatedOutstandingRewards);
  }

  function getStakingDataLoading() {
    if (!address) return false;

    return (
      stakerDetailsLoading ||
      stakedBalanceLoading ||
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
      stakedBalanceFetching ||
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
        updateTime,
        unstakeCoolDown,
        outstandingRewards,
        tokenAllowance,
        canUnstakeTime,
        v1Rewards,
        oldDesignatedVotingAccount,
        getStakingDataLoading,
        getStakingDataFetching,
        setAddressOverride,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}
