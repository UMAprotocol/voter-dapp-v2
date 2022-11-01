import { VotingV2Ethers } from "@uma/contracts-frontend";
import { handleNotifications } from "helpers";
import { ReactNode } from "react";

interface SetDelegate {
  voting: VotingV2Ethers;
  delegateAddress: string;
  notificationMessages: {
    pending: ReactNode;
    success: ReactNode;
    error: ReactNode;
  };
}
export async function setDelegate({ voting, delegateAddress, notificationMessages }: SetDelegate) {
  const tx = await voting.setDelegate(delegateAddress);
  return handleNotifications(tx, {
    pending: notificationMessages.pending,
    success: notificationMessages.success,
    error: notificationMessages.error,
  });
}
