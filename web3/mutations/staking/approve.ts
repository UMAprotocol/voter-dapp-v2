import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constants/addresses";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { NotificationHandlerFn } from "types";

export async function approve({
  votingToken,
  approveAmount,
  notificationHandler,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: BigNumber;
  notificationHandler: NotificationHandlerFn;
}) {
  const tx = await votingToken.functions.approve(votingContractAddress, approveAmount);

  notificationHandler({
    contractTransaction: tx,
    pendingMessage: `Approving ${formatNumberForDisplay(approveAmount)} UMA...`,
  });

  return await tx.wait();
}
