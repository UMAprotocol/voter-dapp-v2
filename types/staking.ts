import { BigNumber } from "ethers";

export type StakerDetailsT = {
  pendingUnstake: BigNumber;
  canUnstakeTime: Date | undefined;
  unstakeRequestTime: Date | undefined;
  delegate: string;
};

export type V1RewardsT = {
  multicallPayload: string[];
  totalRewards: BigNumber;
};
