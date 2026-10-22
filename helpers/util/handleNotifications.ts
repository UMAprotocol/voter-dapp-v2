import { ContractTransaction } from "ethers";
import { ReactNode } from "react";
import { emitErrorEvent, emitPendingEvent, emitSuccessEvent } from "helpers";

// Confirmation failures already have a notification associated with their hash.
const notifiedErrors = new WeakSet<object>();

export function hasTransactionErrorNotification(error: unknown) {
  return (
    typeof error === "object" && error !== null && notifiedErrors.has(error)
  );
}

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
    if (typeof e === "object" && e !== null) notifiedErrors.add(e);
    throw e;
  }
}
