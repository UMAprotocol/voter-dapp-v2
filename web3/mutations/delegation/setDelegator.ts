import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ReactNode } from "react";
import { NotificationHandlerFn } from "types";

interface SetDelegator {
  voting: VotingV2Ethers;
  delegatorAddress: string;
  notificationMessage: ReactNode;
  notificationHandler: NotificationHandlerFn;
}
export async function setDelegator({
  voting,
  delegatorAddress,
  notificationMessage,
  notificationHandler,
}: SetDelegator) {
  const tx = await voting.setDelegator(delegatorAddress);

  notificationHandler({
    contractTransaction: tx,
    pendingMessage: notificationMessage,
  });

  return tx.wait();
}
