import { ContractReceipt, ContractTransaction } from "ethers";
import { handleNotifications } from "helpers";

export const VOTE_BATCH_SIZE = 100;

export type VoteBatchProgress = {
  current: number;
  total: number;
  submitted: boolean;
};

export async function submitVoteBatches<T>({
  votes,
  action,
  submitBatch,
  onConfirmed,
  onProgress,
}: {
  votes: T[];
  action: "commit" | "reveal";
  submitBatch: (batch: T[]) => Promise<ContractTransaction | undefined>;
  onConfirmed: (batch: T[], receipt: ContractReceipt) => void;
  onProgress: (progress: VoteBatchProgress) => void;
}) {
  if (!votes.length) return;

  const total = Math.ceil(votes.length / VOTE_BATCH_SIZE);
  const confirmations: Promise<PromiseSettledResult<void>>[] = [];
  let submissionFailure: { error: unknown } | undefined;
  let current = 0;
  try {
    for (let offset = 0; offset < votes.length; offset += VOTE_BATCH_SIZE) {
      current = offset / VOTE_BATCH_SIZE + 1;
      if (total > 1) onProgress({ current, total, submitted: false });
      const batch = votes.slice(offset, offset + VOTE_BATCH_SIZE);
      // Request the next signature once this transaction is broadcast.
      const tx = await submitBatch(batch);
      if (!tx) continue;

      const votesLabel = `${batch.length} ${
        batch.length === 1 ? "vote" : "votes"
      }`;
      const confirmation = handleNotifications(tx, {
        pending: `${
          action === "commit" ? "Committing" : "Revealing"
        } ${votesLabel}...`,
        success: `${
          action === "commit" ? "Committed" : "Revealed"
        } ${votesLabel}`,
        error: `Failed to ${action} ${votesLabel}`,
      }).then((receipt) => onConfirmed(batch, receipt));
      // Observe failures even while another wallet prompt is open, and keep
      // tracking every transaction already submitted.
      confirmations.push(
        confirmation.then(
          () => ({ status: "fulfilled", value: undefined } as const),
          (reason: unknown) => ({ status: "rejected", reason } as const)
        )
      );
    }
  } catch (error) {
    submissionFailure = { error };
  }

  if (total > 1) onProgress({ current, total, submitted: true });
  const results = await Promise.all(confirmations);
  if (submissionFailure) throw submissionFailure.error;
  const failedConfirmation = results.find(
    (result) => result.status === "rejected"
  );
  if (failedConfirmation?.status === "rejected") {
    throw failedConfirmation.reason;
  }
}
