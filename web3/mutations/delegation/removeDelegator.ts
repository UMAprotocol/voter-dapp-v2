import { VotingV2Ethers } from "@uma/contracts-frontend";
import { emitPendingEvent, zeroAddress } from "helpers";
import { ReactNode } from "react";

export async function removeDelegator({
  voting,
  notificationMessage,
}: {
  voting: VotingV2Ethers;
  notificationMessage: ReactNode;
}) {
  const tx = await voting.setDelegator(zeroAddress);
  emitPendingEvent(notificationMessage, tx.hash);
  return await tx.wait();
}
