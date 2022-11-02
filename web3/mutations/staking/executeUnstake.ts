import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function executeUnstake({
  voting,
  pendingUnstake,
}: {
  voting: VotingV2Ethers;
  pendingUnstake: BigNumber;
}) {
  const tx = await voting.functions.executeUnstake();
  return handleNotifications(tx, {
    pending: `Executing unstake of ${formatNumberForDisplay(pendingUnstake)} UMA...`,
    success: `Executed unstake of ${formatNumberForDisplay(pendingUnstake)} UMA`,
    error: `Failed to execute unstake of ${formatNumberForDisplay(pendingUnstake)} UMA`,
  });
}
