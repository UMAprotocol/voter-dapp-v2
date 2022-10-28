import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationFn } from "types";

export async function stake({
  voting,
  stakeAmount,
  addPendingNotification,
}: {
  voting: VotingV2Ethers;
  stakeAmount: BigNumber;
  addPendingNotification: AddNotificationFn;
}) {
  const tx = await voting.functions.stake(stakeAmount);
  addPendingNotification(`Staking ${formatNumberForDisplay(stakeAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
