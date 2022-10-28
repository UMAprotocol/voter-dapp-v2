import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ReactNode } from "react";
import { NotificationHandlerFn } from "types";

interface SetDelegate {
  voting: VotingV2Ethers;
  delegateAddress: string;
  notificationMessage: ReactNode;
  notificationHandler: NotificationHandlerFn;
}
export async function setDelegate({ voting, delegateAddress, notificationMessage, notificationHandler }: SetDelegate) {
  const tx = await voting.setDelegate(delegateAddress);

  notificationHandler({
    contractTransaction: tx,
    pendingMessage: notificationMessage,
  });

  return tx.wait();
}
