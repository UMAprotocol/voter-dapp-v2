import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { NotificationHandlerFn } from "types";

export async function executeUnstake({
  voting,
  pendingUnstake,
  notificationHandler,
}: {
  voting: VotingV2Ethers;
  pendingUnstake: BigNumber;
  notificationHandler: NotificationHandlerFn;
}) {
  const tx = await voting.functions.executeUnstake();

  notificationHandler({
    contractTransaction: tx,
    pendingMessage: `Executing unstake of ${formatNumberForDisplay(pendingUnstake)} UMA...`,
  });

  return await tx.wait();
}
