import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committedVotesKey, encryptedVotesKey } from "constants/queryKeys";
import { EncryptedVotesByKeyT, VoteExistsByKeyT } from "types/global";
import { commitVotes } from "web3/mutations";

export default function useCommitVotes() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(commitVotes, {
    onSuccess: (_data, { formattedVotes }) => {
      queryClient.setQueryData<VoteExistsByKeyT>([committedVotesKey], (oldCommittedVotes) => {
        const newCommittedVotes = { ...oldCommittedVotes };

        for (const { uniqueKey } of formattedVotes) {
          newCommittedVotes[uniqueKey] = true;
        }

        return newCommittedVotes;
      });

      queryClient.setQueryData<EncryptedVotesByKeyT>([encryptedVotesKey], (oldEncryptedVotes) => {
        const newEncryptedVotes = { ...oldEncryptedVotes };

        for (const { uniqueKey, encryptedVote } of formattedVotes) {
          newEncryptedVotes[uniqueKey] = encryptedVote;
        }

        return newEncryptedVotes;
      });
    },
  });

  return mutate;
}
