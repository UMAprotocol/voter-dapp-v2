import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { NotificationHandlerFn } from "types";

export async function withdrawRewards({
  voting,
  outstandingRewards,
  notificationHandler,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
  notificationHandler: NotificationHandlerFn;
}) {
  const tx = await voting.functions.withdrawRewards();
  notificationHandler({
    contractTransaction: tx,
    pendingMessage: `Withdrawing ${formatNumberForDisplay(outstandingRewards)} UMA...`,
  });
  return await tx.wait();
}
