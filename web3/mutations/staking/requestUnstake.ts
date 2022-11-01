import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { emitPendingEvent, formatNumberForDisplay } from "helpers";

export async function requestUnstake({ voting, unstakeAmount }: { voting: VotingV2Ethers; unstakeAmount: BigNumber }) {
  const tx = await voting.functions.requestUnstake(unstakeAmount);
  emitPendingEvent(`Requesting unstake of ${formatNumberForDisplay(unstakeAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
