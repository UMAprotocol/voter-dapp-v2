import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { NotificationHandlerFn } from "types";

export async function withdrawAndRestake({
  voting,
  outstandingRewards,
  notificationHandler,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
  notificationHandler: NotificationHandlerFn;
}) {
  const tx = await voting.functions.withdrawAndRestake();
  notificationHandler({
    contractTransaction: tx,
    pendingMessage: `Withdrawing and restaking ${formatNumberForDisplay(outstandingRewards)} UMA...`,
  });
  return await tx.wait();
}
