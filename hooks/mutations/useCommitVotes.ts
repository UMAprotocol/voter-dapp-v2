import { useMutation, useQueryClient } from "@tanstack/react-query";
import { committedVotesKey, encryptedVotesKey } from "constants/queryKeys";
import { useVoteTimingContext } from "hooks/contexts";
import useHandleError from "hooks/helpers/useHandleError";
import { useAccountDetails } from "hooks/queries";
import { EncryptedVotesByKeyT, VoteExistsByKeyT } from "types/global";
import { commitVotes } from "web3/mutations";

export default function useCommitVotes() {
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
