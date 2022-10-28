import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationFn } from "types";

export async function requestUnstake({
  voting,
  unstakeAmount,
  addPendingNotification,
}: {
  voting: VotingV2Ethers;
  unstakeAmount: BigNumber;
  addPendingNotification: AddNotificationFn;
}) {
  const tx = await voting.functions.requestUnstake(unstakeAmount);
  addPendingNotification(`Requesting unstake of ${formatNumberForDisplay(unstakeAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
