import { useQuery } from "@tanstack/react-query";
import { voteTransactionHashesKey } from "constant";
import {
  useActiveVotes,
  useContractsContext,
  useHandleError,
  usePastVotes,
  useUpcomingVotes,
} from "hooks";
import { getVoteTransactionHashes } from "web3";

export function useVoteTransactionHashes() {
  const { voting } = useContractsContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const {
    data: { activeVotes },
  } = useActiveVotes();
  const {
    data: { upcomingVotes },
  } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();

  const queryResult = useQuery(
    [voteTransactionHashesKey, activeVotes, upcomingVotes, pastVotes],
    () =>
      getVoteTransactionHashes(voting, {
        ...activeVotes,
        ...upcomingVotes,
        ...pastVotes,
      }),
    {
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
