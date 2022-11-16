import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constant";
import { BigNumber } from "ethers";
import {
  formatNumberForDisplay,
  handleNotifications,
  maximumApprovalAmount,
} from "helpers";

export async function approve({
  votingToken,
  approveAmount,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: BigNumber;
}) {
  const tx = await votingToken.functions.approve(
    votingContractAddress,
    approveAmount
  );

  const amountToDisplay = approveAmount.eq(maximumApprovalAmount)
    ? "unlimited"
    : formatNumberForDisplay(approveAmount);

  return handleNotifications(tx, {
    pending: `Approving ${amountToDisplay} UMA...`,
    success: `Approved ${amountToDisplay} UMA`,
    error: `Failed to approve ${amountToDisplay} UMA`,
  });
}
