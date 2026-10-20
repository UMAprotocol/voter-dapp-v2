import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revealedVotesKey } from "constant";
import { useHandleError, useVoteTimingContext } from "hooks";
import { VoteExistsByKeyT } from "types";
import { revealVotes } from "web3";

export function useRevealVotes(address: string | undefined) {
  const queryClient = useQueryClient();
  const { roundId } = useVoteTimingContext();
  const { onError, clearErrors } = useHandleError();

  const { mutate, isLoading } = useMutation({
    mutationFn: revealVotes,
    // A wallet or round change while confirming must not move this batch
    // into the new account's or round's cache.
    onMutate: () => ({
      queryKey: [revealedVotesKey, address, roundId],
    }),
    onError,
    onSuccess: (data, { votesToReveal }, context) => {
      clearErrors();
      if (!context) return;

      queryClient.setQueryData<VoteExistsByKeyT>(
        context.queryKey,
        (oldRevealedVotes) => {
          const newRevealedVotes = { ...oldRevealedVotes };

          for (const { uniqueKey } of votesToReveal) {
            if (data?.transactionHash) {
              newRevealedVotes[uniqueKey] = data.transactionHash;
            }
          }

          return newRevealedVotes;
        }
      );
    },
  });

  return {
    revealVotesMutation: mutate,
    isRevealingVotes: isLoading,
  };
}
