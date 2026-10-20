import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  committedVotesKey,
  committedVotesKeyByCaller,
  encryptedVotesKey,
} from "constant";
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
  }>();

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({ voting, formattedVotes }: CommitVotes) => {
      if (!formattedVotes.length) return;

      const batchSize = commitBatchSize ?? formattedVotes.length;
      const total = Math.ceil(formattedVotes.length / batchSize);

      for (
        let offset = 0;
        offset < formattedVotes.length;
        offset += batchSize
      ) {
        if (total > 1) {
          setCommitBatchProgress({
            current: offset / batchSize + 1,
            total,
          });
        }
        const batch = formattedVotes.slice(offset, offset + batchSize);
        // Wait for confirmation before requesting the next transaction.
        const receipt = await commitVotes({ voting, formattedVotes: batch });
        if (!receipt) continue;

        // Keep confirmed batches available even if a later batch fails.
        cacheCommittedVotes(batch, receipt.transactionHash);
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
