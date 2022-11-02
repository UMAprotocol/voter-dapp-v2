import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function withdrawAndRestake({
  voting,
  outstandingRewards,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
}) {
  const tx = await voting.functions.withdrawAndRestake();
  return handleNotifications(tx, {
    pending: `Withdrawing and restaking ${formatNumberForDisplay(
      outstandingRewards
    )} UMA...`,
    success: `Withdrew and restaked ${formatNumberForDisplay(
      outstandingRewards
    )} UMA`,
    error: `Failed to withdraw and restake ${formatNumberForDisplay(
      outstandingRewards
    )} UMA`,
  });
}
