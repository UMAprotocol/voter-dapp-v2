import { VotingV2Ethers } from "@uma/contracts-frontend";
import { handleNotifications } from "helpers";
import { ReactNode } from "react";

interface SetDelegator {
  voting: VotingV2Ethers;
  delegatorAddress: string;
  notificationMessages: {
    pending: ReactNode;
    success: ReactNode;
    error: ReactNode;
  };
}
export async function setDelegator({
  voting,
  delegatorAddress,
  notificationMessages,
}: SetDelegator) {
  const tx = await voting.setDelegator(delegatorAddress);
  return handleNotifications(tx, {
    pending: notificationMessages.pending,
    success: notificationMessages.success,
    error: notificationMessages.error,
  });
}
