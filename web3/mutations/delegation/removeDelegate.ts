import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";
import { ReactNode } from "react";
import { NotificationHandlerFn } from "types";

export async function removeDelegate({
  voting,
  notificationMessage,
  notificationHandler,
}: {
  voting: VotingV2Ethers;
  notificationMessage: ReactNode;
  notificationHandler: NotificationHandlerFn;
}) {
  const tx = await voting.setDelegate(zeroAddress);

  notificationHandler({
    contractTransaction: tx,
    pendingMessage: notificationMessage,
  });

  return tx.wait();
}
