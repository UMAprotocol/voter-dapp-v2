import { VotingV2Ethers } from "@uma/contracts-frontend";
import { emitPendingEvent } from "helpers";
import { ReactNode } from "react";

interface SetDelegate {
  voting: VotingV2Ethers;
  delegateAddress: string;
  notificationMessage: ReactNode;
}
export async function setDelegate({ voting, delegateAddress, notificationMessage }: SetDelegate) {
  const tx = await voting.setDelegate(delegateAddress);
  emitPendingEvent(notificationMessage, tx.hash);
  return tx.wait();
}
