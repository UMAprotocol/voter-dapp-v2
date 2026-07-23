import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  committedVotesKey,
  committedVotesKeyByCaller,
  encryptedVotesKey,
} from "constant";
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

      const addCommittedVotes = (oldCommittedVotes?: VoteExistsByKeyT) => {
        const newCommittedVotes = { ...oldCommittedVotes };

        for (const { uniqueKey } of formattedVotes) {
          if (data?.transactionHash) {
            newCommittedVotes[uniqueKey] = data.transactionHash;
          }
        }

        return newCommittedVotes;
      };

      queryClient.setQueryData<VoteExistsByKeyT>(
        [committedVotesKey, address, roundId],
        addCommittedVotes
      );

      // the connected account is always the caller of the commit transaction;
      // getCanReveal requires this lookup, so seed it too or reveal stays
      // disabled until the query refetches
      queryClient.setQueryData<VoteExistsByKeyT>(
        [committedVotesKeyByCaller, address, roundId],
        addCommittedVotes
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
