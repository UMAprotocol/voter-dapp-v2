import { ContractTransaction } from "ethers";
import { ReactNode } from "react";
import { emitErrorEvent, emitPendingEvent, emitSuccessEvent } from "helpers";

export async function handleNotifications(
  tx: ContractTransaction,
  messages: { pending: ReactNode; success: ReactNode; error: ReactNode }
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
