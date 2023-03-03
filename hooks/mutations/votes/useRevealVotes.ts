import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revealVotes } from "chain";
import { revealedVotesKey } from "constant";
import { useAccountDetails, useHandleError, useVoteTimingContext } from "hooks";
import { VoteExistsByKeyT } from "types";

export function useRevealVotes() {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const { onError, clearErrors } = useHandleError();

  const { mutate, isLoading } = useMutation(revealVotes, {
    onError,
    onSuccess: (data, { votesToReveal }) => {
      clearErrors();

      queryClient.setQueryData<VoteExistsByKeyT>(
        [revealedVotesKey, address, roundId],
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
