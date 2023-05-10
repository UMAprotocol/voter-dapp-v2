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
import { ReactNode, createContext, useMemo, useState } from "react";
import { OldDesignatedVotingAccountT, V1RewardsT } from "types";

export interface StakingContextState {
  hasStaked: boolean | undefined;
  stakedBalance: BigNumber | undefined;
  unstakedBalance: BigNumber | undefined;
  pendingUnstake: BigNumber | undefined;
  updateTime: BigNumber | undefined;
  outstandingRewards: BigNumber | undefined;
  tokenAllowance: BigNumber | undefined;
  canUnstakeTime: Date | undefined;
  unstakeCoolDown: BigNumber | undefined;
  v1Rewards: V1RewardsT | undefined;
  oldDesignatedVotingAccount: OldDesignatedVotingAccountT | undefined;
  setAddressOverride: (address?: string) => void;
}

export const defaultStakingContextState: StakingContextState = {
  hasStaked: undefined,
  stakedBalance: undefined,
  unstakedBalance: undefined,
  pendingUnstake: undefined,
  updateTime: undefined,
  outstandingRewards: undefined,
  tokenAllowance: undefined,
  canUnstakeTime: undefined,
  unstakeCoolDown: undefined,
  v1Rewards: undefined,
  oldDesignatedVotingAccount: undefined,
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

  const { data: stakerDetails } = useStakerDetails(address);
  const {
    pendingUnstake,
    canUnstakeTime,
    rewardsPaidPerToken,
    outstandingRewards: voterOutstandingRewards,
  } = stakerDetails || {};
  const { data: stakedBalance } = useStakedBalance(address);
  const { data: unstakedBalance } = useUnstakedBalance(address);
  const { data: rewardCalculationInputs } = useRewardsCalculationInputs();
  const { emissionRate, rewardPerTokenStored, cumulativeStake, updateTime } =
    rewardCalculationInputs || {};
  const { data: tokenAllowance } = useTokenAllowance();
  const { data: unstakeCoolDown } = useUnstakeCoolDown();
  const { data: v1Rewards } = useV1Rewards();
  const [outstandingRewards, setOutstandingRewards] = useState<
    BigNumber | undefined
  >(undefined);
  const { data: oldDesignatedVotingAccount } =
    useIsOldDesignatedVotingAccount();

  useInterval(() => {
    updateOutstandingRewards();
  }, 100);

  function updateOutstandingRewards() {
    // if any of the inputs are undefined return
    if (
      !voterOutstandingRewards ||
      !stakedBalance ||
      !rewardsPaidPerToken ||
      !cumulativeStake ||
      !rewardPerTokenStored ||
      !updateTime ||
      !emissionRate
    ) {
      return;
    }

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

  const hasStaked = stakedBalance?.gt(0);

  const value = useMemo(
    () => ({
      hasStaked,
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
      setAddressOverride,
    }),
    [
      canUnstakeTime,
      hasStaked,
      oldDesignatedVotingAccount,
      outstandingRewards,
      pendingUnstake,
      stakedBalance,
      tokenAllowance,
      unstakeCoolDown,
      unstakedBalance,
      updateTime,
      v1Rewards,
    ]
  );

  return (
    <StakingContext.Provider value={value}>{children}</StakingContext.Provider>
  );
}
