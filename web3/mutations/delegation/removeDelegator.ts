import { VotingV2Ethers } from "@uma/contracts-frontend";
import { handleNotifications, zeroAddress } from "helpers";
import { ReactNode } from "react";

export async function removeDelegator({
  voting,
  notificationMessages,
}: {
  voting: VotingV2Ethers;
  notificationMessages: { pending: ReactNode; success: ReactNode; error: ReactNode };
}) {
  const tx = await voting.setDelegator(zeroAddress);
  return handleNotifications(tx, {
    pending: notificationMessages.pending,
    success: notificationMessages.success,
    error: notificationMessages.error,
  });
}
