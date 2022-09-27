import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { useAccountDetails, useHandleError, useVoteTimingContext } from "hooks";
import { VoteExistsByKeyT } from "types";
import { revealVotes } from "web3";

export function useRevealVotes() {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const { mutate, isLoading } = useMutation(revealVotes, {
    onSuccess: (_data, { votesToReveal }) => {
      queryClient.setQueryData<VoteExistsByKeyT>([revealedVotesKey, address, roundId], (oldRevealedVotes) => {
        const newRevealedVotes = { ...oldRevealedVotes };

        for (const { uniqueKey } of votesToReveal) {
          newRevealedVotes[uniqueKey] = true;
        }

        return newRevealedVotes;
      });
    },
    onError,
  });

  return {
    revealVotesMutation: mutate,
    isRevealingVotes: isLoading,
  };
}
