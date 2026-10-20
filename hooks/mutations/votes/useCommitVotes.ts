import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  committedVotesKey,
  committedVotesKeyByCaller,
  encryptedVotesKey,
} from "constant";
import { handleNotifications } from "helpers";
import { useAccountDetails, useHandleError, useVoteTimingContext } from "hooks";
import { useState } from "react";
import { CommitVotes, EncryptedVotesByKeyT, VoteExistsByKeyT } from "types";
import { commitVotes } from "web3";

const METAMASK_COMMIT_BATCH_SIZE = 100;

export function useCommitVotes(address: string | undefined) {
  const queryClient = useQueryClient();
  const { roundId } = useVoteTimingContext();
  const { connectedWallet } = useAccountDetails();
  const commitBatchSize =
    connectedWallet?.label === "MetaMask"
      ? METAMASK_COMMIT_BATCH_SIZE
      : undefined;
  const { onError, clearErrors } = useHandleError();
  const [commitBatchProgress, setCommitBatchProgress] = useState<{
    current: number;
    total: number;
    submitted: boolean;
  }>();

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({ voting, formattedVotes }: CommitVotes) => {
      if (!formattedVotes.length) return;

      const batchSize = commitBatchSize ?? formattedVotes.length;
      const total = Math.ceil(formattedVotes.length / batchSize);
      const confirmations: Promise<PromiseSettledResult<void>>[] = [];
      let submissionFailure: { error: unknown } | undefined;

      try {
        for (
          let offset = 0;
          offset < formattedVotes.length;
          offset += batchSize
        ) {
          if (total > 1) {
            setCommitBatchProgress({
              current: offset / batchSize + 1,
              total,
              submitted: false,
            });
          }
          const batch = formattedVotes.slice(offset, offset + batchSize);
          // Request the next signature once this transaction is broadcast.
          const tx = await commitVotes({ voting, formattedVotes: batch });
          if (!tx) continue;

          const votesLabel = `${batch.length} ${
            batch.length === 1 ? "vote" : "votes"
          }`;
          const confirmation = handleNotifications(tx, {
            pending: `Committing ${votesLabel}...`,
            success: `Committed ${votesLabel}`,
            error: `Failed to commit ${votesLabel}`,
          }).then((receipt) => {
            cacheCommittedVotes(batch, receipt.transactionHash);
          });
          // Observe failures immediately, even while another wallet prompt is
          // open, and keep tracking every transaction already submitted.
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

      if (total > 1) {
        setCommitBatchProgress((progress) =>
          progress ? { ...progress, submitted: true } : progress
        );
      }
      const results = await Promise.all(confirmations);
      if (submissionFailure) throw submissionFailure.error;
      const failedConfirmation = results.find(
        (result) => result.status === "rejected"
      );
      if (failedConfirmation?.status === "rejected") {
        throw failedConfirmation.reason;
      }
    },
    onError,
    onSuccess: clearErrors,
    onSettled: () => setCommitBatchProgress(undefined),
  });

  function cacheCommittedVotes(
    formattedVotes: CommitVotes["formattedVotes"],
    transactionHash: string
  ) {
    const addCommittedVotes = (oldCommittedVotes?: VoteExistsByKeyT) => {
      const newCommittedVotes = { ...oldCommittedVotes };

      for (const { uniqueKey } of formattedVotes) {
        newCommittedVotes[uniqueKey] = transactionHash;
      }

      return newCommittedVotes;
    };

    queryClient.setQueryData<VoteExistsByKeyT>(
      [committedVotesKey, address, roundId],
      addCommittedVotes
    );

    // the connected account is always the caller of the commit transaction;
    // getCanReveal requires this lookup, so seed it too or reveal stays
    // disabled until the query refetches
    queryClient.setQueryData<VoteExistsByKeyT>(
      [committedVotesKeyByCaller, address, roundId],
      addCommittedVotes
    );

    queryClient.setQueryData<EncryptedVotesByKeyT>(
      [encryptedVotesKey, address, roundId],
      (oldEncryptedVotes) => {
        const newEncryptedVotes = { ...oldEncryptedVotes };

        for (const { uniqueKey, encryptedVote } of formattedVotes) {
          newEncryptedVotes[uniqueKey] = encryptedVote;
        }

        return newEncryptedVotes;
      }
    );
  }

  return {
    commitVotesMutation: mutate,
    isCommittingVotes: isLoading,
    commitBatchProgress,
    commitBatchSize,
  };
}
