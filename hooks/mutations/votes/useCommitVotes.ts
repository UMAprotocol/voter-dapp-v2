import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committedVotesKey, encryptedVotesKey } from "constants/queryKeys";
import { useAccountDetails, useHandleError, useVoteTimingContext } from "hooks";
import { EncryptedVotesByKeyT, VoteExistsByKeyT } from "types";
import { commitVotes } from "web3";

export function useCommitVotes() {
  const queryClient = useQueryClient();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const { mutate, isLoading } = useMutation(commitVotes, {
    onSuccess: (_data, { formattedVotes }) => {
      queryClient.setQueryData<VoteExistsByKeyT>([committedVotesKey, address, roundId], (oldCommittedVotes) => {
        const newCommittedVotes = { ...oldCommittedVotes };

        for (const { uniqueKey } of formattedVotes) {
          newCommittedVotes[uniqueKey] = true;
        }

        return newCommittedVotes;
      });

      queryClient.setQueryData<EncryptedVotesByKeyT>([encryptedVotesKey, address, roundId], (oldEncryptedVotes) => {
        const newEncryptedVotes = { ...oldEncryptedVotes };

        for (const { uniqueKey, encryptedVote } of formattedVotes) {
          newEncryptedVotes[uniqueKey] = encryptedVote;
        }

        return newEncryptedVotes;
      });
    },
    onError,
  });

  return {
    commitVotesMutation: mutate,
    isCommittingVotes: isLoading,
  };
}
