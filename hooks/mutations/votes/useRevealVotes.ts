import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revealedVotesKey } from "constant";
import { getVotesToReveal } from "helpers/voting/getVotesToReveal";
import {
  submitVoteBatches,
  VOTE_BATCH_SIZE,
  VoteBatchProgress,
} from "helpers/voting/submitVoteBatches";
import { useHandleError, useVoteTimingContext } from "hooks";
import { useRef, useState } from "react";
import { RevealVotes, VoteExistsByKeyT, VoteT } from "types";
import { revealVotes } from "web3";

export function useRevealVotes(address: string | undefined) {
  const queryClient = useQueryClient();
  const { roundId } = useVoteTimingContext();
  const { onError, clearErrors } = useHandleError();
  // A stale refetch can omit mined reveals. Keep confirmations independently
  // so retries cannot reveal those votes again for this account and round.
  const confirmedRevealsByScope = useRef<Record<string, VoteExistsByKeyT>>({});
  const scope = JSON.stringify([address, roundId]);
  const [revealBatchProgress, setRevealBatchProgress] =
    useState<VoteBatchProgress>();

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ voting, votesToReveal }: RevealVotes) => {
      // Capture the voting account (the delegator for delegated reveals) and
      // round for this run, even if either changes while confirming.
      const queryKey = [revealedVotesKey, address, roundId];
      return submitVoteBatches({
        votes: getPendingReveals(votesToReveal),
        action: "reveal",
        submitBatch: (batch) => revealVotes({ voting, votesToReveal: batch }),
        onConfirmed: (batch, receipt) => {
          const confirmedReveals = (confirmedRevealsByScope.current[scope] ??=
            {});
          const batchReveals = Object.fromEntries(
            batch.map(({ uniqueKey }) => [uniqueKey, receipt.transactionHash])
          );
          Object.assign(confirmedReveals, batchReveals);
          queryClient.setQueryData<VoteExistsByKeyT>(
            queryKey,
            (oldRevealedVotes) => ({
              ...oldRevealedVotes,
              ...confirmedReveals,
            })
          );
        },
        onProgress: setRevealBatchProgress,
      });
    },
    onError,
    onSuccess: clearErrors,
    onSettled: () => setRevealBatchProgress(undefined),
  });

  function getPendingReveals(votes: VoteT[]) {
    return getVotesToReveal(votes, {
      ...queryClient.getQueryData<VoteExistsByKeyT>([
        revealedVotesKey,
        address,
        roundId,
      ]),
      ...confirmedRevealsByScope.current[scope],
    });
  }

  return {
    revealVotesMutation: mutate,
    isRevealingVotes: isLoading,
    revealBatchProgress,
    revealBatchSize: VOTE_BATCH_SIZE,
    getPendingReveals,
  };
}
