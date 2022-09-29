import { useQuery } from "@tanstack/react-query";
import { voteTransactionHashesKey } from "constants/queryKeys";
import { useActiveVotes, useHandleError, usePastVotes, useUpcomingVotes } from "hooks";
import { useContractsContext } from "hooks/contexts/useContractsContext";
import { getVoteTransactionHashes } from "web3/queries/votes/getVoteTransactionHashes";

export function useVoteTransactionHashes() {
  const { voting } = useContractsContext();
  const onError = useHandleError();
  const { data: activeVotes } = useActiveVotes();
  const {
    data: { upcomingVotes },
  } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();

  const queryResult = useQuery(
    [voteTransactionHashesKey, activeVotes, upcomingVotes, pastVotes],
    () => getVoteTransactionHashes(voting, { ...activeVotes, ...upcomingVotes, ...pastVotes }),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
