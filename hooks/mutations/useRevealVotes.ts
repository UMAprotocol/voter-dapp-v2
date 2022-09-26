import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { useVoteTimingContext } from "hooks/contexts";
import { useAccountDetails } from "hooks/queries";
import { VoteExistsByKeyT } from "types/global";
import { revealVotes } from "web3/mutations";

export default function useRevealVotes() {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();

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
  });

  return {
    revealVotesMutation: mutate,
    isRevealingVotes: isLoading,
  };
}
