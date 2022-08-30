import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committedVotesKey } from "constants/queryKeys";
import { VoteExistsByKeyT } from "types/global";
import { commitVotes } from "web3/mutations";

export default function useCommitVotes() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(commitVotes, {
    onSuccess: (_data, { selectedVotes }) => {
      queryClient.setQueryData<VoteExistsByKeyT>([committedVotesKey], (oldCommittedVotes) => {
        const newCommittedVotes = { ...oldCommittedVotes };

        for (const uniqueKey of Object.keys(selectedVotes)) {
          newCommittedVotes[uniqueKey] = true;
        }

        return newCommittedVotes;
      });
    },
  });

  return mutate;
}
