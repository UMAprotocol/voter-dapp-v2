import { useQuery } from "@tanstack/react-query";
import { augmentedVoteDataKey } from "constant";
import { useHandleError } from "hooks/helpers/useHandleError";
import { getAugmentedVoteData } from "web3";
import { useActiveVotes } from "./useActiveVotes";
import { usePastVotes } from "./usePastVotes";
import { useUpcomingVotes } from "./useUpcomingVotes";

export function useAugmentedVoteData() {
  const {
    data: { activeVotes },
  } = useActiveVotes();
  const {
    data: { upcomingVotes },
  } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const allVotes = { ...activeVotes, ...upcomingVotes, ...pastVotes };

  const queryResult = useQuery({
    queryKey: [augmentedVoteDataKey, activeVotes, upcomingVotes, pastVotes],
    queryFn: () => getAugmentedVoteData(allVotes),
    initialData: {},
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
