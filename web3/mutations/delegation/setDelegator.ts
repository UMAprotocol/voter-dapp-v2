import { VotingV2Ethers } from "@uma/contracts-frontend";
import { emitPendingEvent } from "helpers";
import { ReactNode } from "react";

interface SetDelegator {
  voting: VotingV2Ethers;
  delegatorAddress: string;
  notificationMessage: ReactNode;
}
export async function setDelegator({ voting, delegatorAddress, notificationMessage }: SetDelegator) {
  const tx = await voting.setDelegator(delegatorAddress);
  emitPendingEvent(notificationMessage, tx.hash);
  return await tx.wait();
}
