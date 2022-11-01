import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay, handleNotifications } from "helpers";

export async function stake({ voting, stakeAmount }: { voting: VotingV2Ethers; stakeAmount: BigNumber }) {
  const tx = await voting.functions.stake(stakeAmount);

  return handleNotifications(tx, {
    pending: `Staking ${formatNumberForDisplay(stakeAmount)} UMA...`,
    success: `Staked ${formatNumberForDisplay(stakeAmount)} UMA`,
    error: `Failed to stake ${formatNumberForDisplay(stakeAmount)} UMA`,
  });
}
