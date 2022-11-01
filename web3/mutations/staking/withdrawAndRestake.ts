import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { emitPendingEvent, formatNumberForDisplay } from "helpers";

export async function withdrawAndRestake({
  voting,
  outstandingRewards,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
}) {
  const tx = await voting.functions.withdrawAndRestake();
  emitPendingEvent(`Withdrawing and restaking ${formatNumberForDisplay(outstandingRewards)} UMA...`, tx.hash);
  return await tx.wait();
}
