import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constants/addresses";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationFn } from "types";

export async function approve({
  votingToken,
  approveAmount,
  addPendingNotification,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: BigNumber;
  addPendingNotification: AddNotificationFn;
}) {
  const tx = await votingToken.functions.approve(votingContractAddress, approveAmount);
  addPendingNotification(`Approving ${formatNumberForDisplay(approveAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
