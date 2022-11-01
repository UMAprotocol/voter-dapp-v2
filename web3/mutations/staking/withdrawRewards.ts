import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { emitPendingEvent, formatNumberForDisplay } from "helpers";

export async function withdrawRewards({
  voting,
  outstandingRewards,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
}) {
  const tx = await voting.functions.withdrawRewards();
  emitPendingEvent(`Withdrawing ${formatNumberForDisplay(outstandingRewards)} UMA...`, tx.hash);
  return await tx.wait();
}
