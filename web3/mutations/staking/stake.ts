import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber, ContractTransaction } from "ethers";
import { emitErrorEvent, emitPendingEvent, emitSuccessEvent, formatNumberForDisplay } from "helpers";

export async function stake({ voting, stakeAmount }: { voting: VotingV2Ethers; stakeAmount: BigNumber }) {
  const tx = await voting.functions.stake(stakeAmount);

  return withNotifications(tx, {
    pending: `Staking ${formatNumberForDisplay(stakeAmount)} UMA...`,
    success: `Staked ${formatNumberForDisplay(stakeAmount)} UMA`,
    error: `Failed to stake ${formatNumberForDisplay(stakeAmount)} UMA`,
  });
}

async function withNotifications(
  tx: ContractTransaction,
  messages: { pending: string; success: string; error: string }
) {
  const transactionHash = tx.hash;
  const pendingId = emitPendingEvent({
    message: messages.pending,
    transactionHash,
  });
  try {
    const result = await tx.wait();
    emitSuccessEvent({ message: messages.success, pendingId });
    return result;
  } catch (e) {
    emitErrorEvent({ message: messages.error, pendingId });
    throw e;
  }
}
