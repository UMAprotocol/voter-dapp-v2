import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function withdrawV1Rewards({
  voting,
  totalRewards,
  multicallPayload,
}: {
  voting: VotingV2Ethers;
  totalRewards: BigNumber;
  multicallPayload: string[];
}) {
  const tx = await voting.functions.multicall(multicallPayload);

  return handleNotifications(tx, {
    pending: `Withdrawing ${formatNumberForDisplay(
      totalRewards
    )} UMA v1 rewards...`,
    success: `Withdrew ${formatNumberForDisplay(totalRewards)} UMA v1 rewards`,
    error: `Failed to withdraw ${formatNumberForDisplay(
      totalRewards
    )} UMA v1 rewards`,
  });
}
