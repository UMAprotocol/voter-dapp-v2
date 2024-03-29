import { BigNumber } from "ethers";

export type StakerDetailsT = {
  pendingUnstake: BigNumber;
  canUnstakeTime: Date | undefined;
  delegate: string;
  rewardsPaidPerToken: BigNumber;
  outstandingRewards: BigNumber;
};

export type V1RewardsT = {
  multicallPayload: string[];
  totalRewards: BigNumber;
};

export type RewardCalculationT = {
  emissionRate: BigNumber;
  rewardPerTokenStored: BigNumber;
  cumulativeStake: BigNumber;
  updateTime: BigNumber;
};

export type SubgraphGlobals = {
  global: {
    annualPercentageReturn: number;
  };
};

export type OldDesignatedVotingAccountT = {
  isOldDesignatedVotingAccount: boolean;
  message: string;
  designatedVotingContract: string;
};
