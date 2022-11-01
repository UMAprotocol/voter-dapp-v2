import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constants/addresses";
import { BigNumber } from "ethers";
import { emitPendingEvent, formatNumberForDisplay } from "helpers";

export async function approve({
  votingToken,
  approveAmount,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: BigNumber;
}) {
  const tx = await votingToken.functions.approve(votingContractAddress, approveAmount);
  emitPendingEvent(`Approving ${formatNumberForDisplay(approveAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
