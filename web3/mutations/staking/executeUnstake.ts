import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { emitPendingEvent, formatNumberForDisplay } from "helpers";

export async function executeUnstake({
  voting,
  pendingUnstake,
}: {
  voting: VotingV2Ethers;
  pendingUnstake: BigNumber;
}) {
  const tx = await voting.functions.executeUnstake();
  emitPendingEvent(`Executing unstake of ${formatNumberForDisplay(pendingUnstake)} UMA...`, tx.hash);
  return await tx.wait();
}
