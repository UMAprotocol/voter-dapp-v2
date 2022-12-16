import { VotingTokenEthers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import {
  formatNumberForDisplay,
  handleNotifications,
  maximumApprovalAmount,
} from "helpers";
import { appConfig } from "helpers/config";
const { votingContractAddress } = appConfig;

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
