import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committedVotesKey, encryptedVotesKey } from "constant";
import { useHandleError, useVoteTimingContext } from "hooks";
import { EncryptedVotesByKeyT, VoteExistsByKeyT } from "types";
import { commitVotes } from "web3";

export function useCommitVotes(address: string | undefined) {
  const queryClient = useQueryClient();
  const { roundId } = useVoteTimingContext();
  const { onError, clearErrors } = useHandleError();

  const { mutate, isLoading } = useMutation({
    mutationFn: commitVotes,
    onError,
    onSuccess: (data, { formattedVotes }) => {
      clearErrors();

      queryClient.setQueryData<VoteExistsByKeyT>(
        [committedVotesKey, address, roundId],
        (oldCommittedVotes) => {
          const newCommittedVotes = { ...oldCommittedVotes };

          for (const { uniqueKey } of formattedVotes) {
            if (data?.transactionHash) {
              newCommittedVotes[uniqueKey] = data.transactionHash;
            }
          }

          return newCommittedVotes;
        }
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
    },
  });

  return {
    commitVotesMutation: mutate,
    isCommittingVotes: isLoading,
  };
}
