import { useQuery } from "@tanstack/react-query";
import { activeVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import { getActiveVotes } from "web3";

export function useActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const { hasActiveVotes, hasUpcomingVotes, upcomingVotes } = useVotesContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [activeVotesKey, roundId, hasActiveVotes],
    () => getActiveVotes(voting),
    {
      refetchInterval: (data) => {
        if (data === undefined) return 100;

        if (hasActiveVotes && Object.keys(data).length === 0) {
          return 100;
        }

        if (
          hasUpcomingVotes &&
          Object.keys(data).length === Object.keys(upcomingVotes).length
        ) {
          return 100;
        }

        return false;
      },
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
