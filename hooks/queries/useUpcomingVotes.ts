import { useQuery } from "@tanstack/react-query";
import { upcomingVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { getUpcomingVotes } from "web3/queries";
import useHasActiveVotes from "./useHasActiveVotes";
import makePriceRequestsByKey from "helpers/makePriceRequestsByKey";

export default function useUpcomingVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const { hasActiveVotes } = useHasActiveVotes();

  const { isLoading, isError, data, error } = useQuery([upcomingVotesKey], () => getUpcomingVotes(voting), {
    refetchInterval(data) {
      return data?.length ? false : 1000;
    },
    enabled: hasActiveVotes !== undefined && !hasActiveVotes,
  });

  const eventData = data?.map(({ args }) => args);
  const onlyUpcoming = eventData?.filter((event) => event.roundId.toNumber() > roundId);
  const upcomingVotes = makePriceRequestsByKey(onlyUpcoming);

  return {
    upcomingVotes,
    upcomingVotesIsLoading: isLoading,
    upcomingVotesIsError: isError,
    upcomingVotesError: error,
  };
}
