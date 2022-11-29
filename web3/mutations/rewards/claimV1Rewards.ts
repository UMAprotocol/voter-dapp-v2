import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function claimV1Rewards({
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
    pending: `Claiming ${formatNumberForDisplay(
      totalRewards
    )} UMA v1 rewards...`,
    success: `Claimed ${formatNumberForDisplay(totalRewards)} UMA v1 rewards`,
    error: `Failed to claim ${formatNumberForDisplay(
      totalRewards
    )} UMA v1 rewards`,
  });
}
