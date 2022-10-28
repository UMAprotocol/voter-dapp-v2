import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationFn } from "types";

export async function executeUnstake({
  voting,
  pendingUnstake,
  addPendingNotification,
}: {
  voting: VotingV2Ethers;
  pendingUnstake: BigNumber;
  addPendingNotification: AddNotificationFn;
}) {
  const tx = await voting.functions.executeUnstake();
  addPendingNotification(`Executing unstake of ${formatNumberForDisplay(pendingUnstake)} UMA...`, tx.hash);
  return await tx.wait();
}
