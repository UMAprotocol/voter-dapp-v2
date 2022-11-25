import { BigNumber } from "ethers";

export type StakerDetailsT = {
  stakedBalance: BigNumber;
  pendingUnstake: BigNumber;
  canUnstakeTime: Date | undefined;
  unstakeRequestTime: Date | undefined;
  delegate: string;
};

export type V1RewardsT = {
  multicallPayload: string[];
  totalRewards: BigNumber;
};
