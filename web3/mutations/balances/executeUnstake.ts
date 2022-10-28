import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationT } from "types";

export default async function executeUnstake({
  voting,
  pendingUnstake,
  addNotification,
}: {
  voting: VotingV2Ethers;
  pendingUnstake: BigNumber;
  addNotification: AddNotificationT;
}) {
  const tx = await voting.functions.executeUnstake();
  addNotification(`Executing unstake of ${formatNumberForDisplay(pendingUnstake)} UMA...`, tx.hash);
  return await tx.wait();
}
