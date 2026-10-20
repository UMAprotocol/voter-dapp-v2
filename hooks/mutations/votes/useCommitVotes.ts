import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  committedVotesKey,
  committedVotesKeyByCaller,
  encryptedVotesKey,
} from "constant";
import { getVotesToCommit } from "helpers/voting/getVotesToCommit";
import {
  submitVoteBatches,
  VOTE_BATCH_SIZE,
  VoteBatchProgress,
} from "helpers/voting/submitVoteBatches";
import { useHandleError, useVoteTimingContext } from "hooks";
import { BigNumber } from "ethers";
import { useRef, useState } from "react";
import {
  CommitVotes,
  EncryptedVotesByKeyT,
  SelectedVotesByKeyT,
  VoteExistsByKeyT,
  VoteT,
} from "types";
import { commitVotes } from "web3";

export function useCommitVotes(address: string | undefined) {
  const queryClient = useQueryClient();
  const { roundId } = useVoteTimingContext();
  const { onError, clearErrors } = useHandleError();
  // Confirmation can finish before the encrypted-vote query decrypts the new
  // values. Retain submitted prices so an immediate retry skips them too.
  const confirmedVotesByScope = useRef<
    Record<string, Record<string, { price: string; transactionHash: string }>>
  >({});
  const scope = JSON.stringify([address, roundId]);
  const [commitBatchProgress, setCommitBatchProgress] =
    useState<VoteBatchProgress>();

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({ voting, formattedVotes }: CommitVotes) => {
      const confirmedPrices = getConfirmedPrices();
      const votesToCommit = formattedVotes.filter((vote) => {
        const confirmedPrice = confirmedPrices[vote.uniqueKey];
        return (
          confirmedPrice === undefined ||
          !BigNumber.from(confirmedPrice).eq(vote.price)
        );
      });
      return submitVoteBatches({
        votes: votesToCommit,
        action: "commit",
        submitBatch: (batch) => commitVotes({ voting, formattedVotes: batch }),
        onConfirmed: (batch, receipt) =>
          cacheCommittedVotes(batch, receipt.transactionHash),
        onProgress: setCommitBatchProgress,
      });
    },
    onError,
    onSuccess: clearErrors,
    onSettled: () => setCommitBatchProgress(undefined),
  });

  function getConfirmedPrices() {
    const committedVotes = queryClient.getQueryData<VoteExistsByKeyT>([
      committedVotesKey,
      address,
      roundId,
    ]);
    return Object.fromEntries(
      Object.entries(confirmedVotesByScope.current[scope] ?? {})
        .filter(
          ([uniqueKey, vote]) =>
            committedVotes?.[uniqueKey] === vote.transactionHash
        )
        .map(([uniqueKey, vote]) => [uniqueKey, vote.price])
    );
  }

  function cacheCommittedVotes(
    formattedVotes: CommitVotes["formattedVotes"],
    transactionHash: string
  ) {
    const confirmedVotes = (confirmedVotesByScope.current[scope] ??= {});
    for (const { uniqueKey, price } of formattedVotes) {
      confirmedVotes[uniqueKey] = { price, transactionHash };
    }
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
    commitBatchSize: VOTE_BATCH_SIZE,
    getPendingVotes: (votes: VoteT[], selectedVotes: SelectedVotesByKeyT) =>
      getVotesToCommit(votes, selectedVotes, getConfirmedPrices()),
  };
}
