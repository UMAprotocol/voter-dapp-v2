import { useQuery } from "@tanstack/react-query";
import { activeVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import { useState } from "react";
import { getActiveVotes } from "web3";

export function useActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const { upcomingVotes } = useVotesContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const [numUpcomingVotes, setNumUpcomingVotes] = useState(0);

  const queryResult = useQuery(
    [activeVotesKey, roundId],
    () => {
      setNumUpcomingVotes(Object.keys(upcomingVotes).length);
      return getActiveVotes(voting);
    },
    {
      refetchInterval: (activeVotes) => {
        if (activeVotes === undefined) return 100;

        if (Object.keys(activeVotes).length !== numUpcomingVotes) {
          return 100;
        }

        return false;
      },
      initialData: {},
      onError,
      onSettled: () => {
        setNumUpcomingVotes(0);
      },
    }
  );

  return queryResult;
}
