import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationFn } from "types";

export async function withdrawAndRestake({
  voting,
  outstandingRewards,
  addPendingNotification,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
  addPendingNotification: AddNotificationFn;
}) {
  const tx = await voting.functions.withdrawAndRestake();
  addPendingNotification(`Withdrawing and restaking ${formatNumberForDisplay(outstandingRewards)} UMA...`, tx.hash);
  return await tx.wait();
}
