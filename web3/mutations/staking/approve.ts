import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constant";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function approve({
  votingToken,
  approveAmount,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: BigNumber;
}) {
  const tx = await votingToken.functions.approve(votingContractAddress, approveAmount);
  return handleNotifications(tx, {
    pending: `Approving ${formatNumberForDisplay(approveAmount)} UMA...`,
    success: `Approved ${formatNumberForDisplay(approveAmount)} UMA`,
    error: `Failed to approve ${formatNumberForDisplay(approveAmount)} UMA`,
  });
}
