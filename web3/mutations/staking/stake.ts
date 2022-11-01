import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { emitPendingEvent, formatNumberForDisplay } from "helpers";

export async function stake({ voting, stakeAmount }: { voting: VotingV2Ethers; stakeAmount: BigNumber }) {
  const tx = await voting.functions.stake(stakeAmount);
  emitPendingEvent(`Staking ${formatNumberForDisplay(stakeAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
