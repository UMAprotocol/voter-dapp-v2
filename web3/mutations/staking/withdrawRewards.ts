import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function withdrawRewards({
  voting,
  outstandingRewards,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
}) {
  const tx = await voting.functions.withdrawRewards();

  return handleNotifications(tx, {
    pending: `Withdrawing ${formatNumberForDisplay(outstandingRewards)} UMA...`,
    success: `Withdrew ${formatNumberForDisplay(outstandingRewards)} UMA`,
    error: `Failed to withdraw ${formatNumberForDisplay(outstandingRewards)} UMA`,
  });
}
