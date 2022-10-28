import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationFn } from "types";

export async function withdrawRewards({
  voting,
  outstandingRewards,
  addPendingNotification,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
  addPendingNotification: AddNotificationFn;
}) {
  const tx = await voting.functions.withdrawRewards();
  addPendingNotification(`Withdrawing ${formatNumberForDisplay(outstandingRewards)} UMA rewards...`, tx.hash);
  return await tx.wait();
}
