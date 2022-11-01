import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function requestUnstake({ voting, unstakeAmount }: { voting: VotingV2Ethers; unstakeAmount: BigNumber }) {
  const tx = await voting.functions.requestUnstake(unstakeAmount);
  return handleNotifications(tx, {
    pending: `Requesting unstake of ${formatNumberForDisplay(unstakeAmount)} UMA...`,
    success: `Requested unstake of ${formatNumberForDisplay(unstakeAmount)} UMA`,
    error: `Failed to request unstake of ${formatNumberForDisplay(unstakeAmount)} UMA`,
  });
}
