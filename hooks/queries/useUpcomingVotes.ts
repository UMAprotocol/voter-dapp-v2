import { useQuery } from "@tanstack/react-query";
import { upcomingVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { useHandleError } from "hooks/helpers";
import { getUpcomingVotes } from "web3/queries";

export default function useUpcomingVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([upcomingVotesKey, roundId], () => getUpcomingVotes(voting, roundId), {
    refetchInterval(data) {
      return data ? false : 100;
    },
    initialData: {
      upcomingVotes: {},
      hasUpcomingVotes: false,
    },
    onError,
  });

  return queryResult;
}
