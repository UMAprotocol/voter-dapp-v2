import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constants/addresses";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationT } from "types";

export async function approve({
  votingToken,
  approveAmount,
  addNotification,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: BigNumber;
  addNotification: AddNotificationT;
}) {
  const tx = await votingToken.functions.approve(votingContractAddress, approveAmount);
  addNotification(`Approving ${formatNumberForDisplay(approveAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
