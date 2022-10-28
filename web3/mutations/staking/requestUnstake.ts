import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { NotificationHandlerFn } from "types";

export async function requestUnstake({
  voting,
  unstakeAmount,
  notificationHandler,
}: {
  voting: VotingV2Ethers;
  unstakeAmount: BigNumber;
  notificationHandler: NotificationHandlerFn;
}) {
  const tx = await voting.functions.requestUnstake(unstakeAmount);
  notificationHandler({
    contractTransaction: tx,
    pendingMessage: `Requesting unstake of ${formatNumberForDisplay(unstakeAmount)} UMA...`,
  });
  return await tx.wait();
}
