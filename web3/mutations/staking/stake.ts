import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { NotificationHandlerFn } from "types";

export async function stake({
  voting,
  stakeAmount,
  notificationHandler,
}: {
  voting: VotingV2Ethers;
  stakeAmount: BigNumber;
  notificationHandler: NotificationHandlerFn;
}) {
  const tx = await voting.functions.stake(stakeAmount);
  notificationHandler({
    contractTransaction: tx,
    pendingMessage: `Staking ${formatNumberForDisplay(stakeAmount)} UMA...`,
  });
  return await tx.wait();
}
