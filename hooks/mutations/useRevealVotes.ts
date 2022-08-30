import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { VoteExistsByKeyT } from "types/global";
import { revealVotes } from "web3/mutations";

export default function useRevealVotes() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(revealVotes, {
    onSuccess: (_data, { votesToReveal }) => {
      queryClient.setQueryData<VoteExistsByKeyT>([revealedVotesKey], (oldRevealedVotes) => {
        const newRevealedVotes = { ...oldRevealedVotes };

        for (const { uniqueKey } of votesToReveal) {
          newRevealedVotes[uniqueKey] = true;
        }

        return newRevealedVotes;
      });
    },
  });

  return mutate;
}
