import { useQuery } from "@tanstack/react-query";
import { upcomingVotesKey } from "constants/queryKeys";
import makePriceRequestsByKey from "helpers/makePriceRequestsByKey";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { getUpcomingVotes } from "web3/queries";

export default function useUpcomingVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();

  const { isLoading, isError, data, error } = useQuery([upcomingVotesKey], () => getUpcomingVotes(voting), {
    refetchInterval(data) {
      return data ? false : 100;
    },
  });

  const eventData = data?.map(({ args }) => args);
  const onlyUpcoming = eventData?.filter((event) => event.roundId.toNumber() > roundId);
  const upcomingVotes = makePriceRequestsByKey(onlyUpcoming);
  const hasUpcomingVotes = isLoading ? undefined : Object.keys(upcomingVotes).length > 0;
  return {
    hasUpcomingVotes,
    upcomingVotes,
    upcomingVotesIsLoading: isLoading,
    upcomingVotesIsError: isError,
    upcomingVotesError: error,
  };
}
