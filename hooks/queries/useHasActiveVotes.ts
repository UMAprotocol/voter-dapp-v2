import { useQuery } from "@tanstack/react-query";
import { hasActiveVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { useHandleError } from "hooks/helpers";
import { getHasActiveVotes } from "web3/queries";

export default function useHasActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([hasActiveVotesKey, roundId], () => getHasActiveVotes(voting), {
    refetchInterval: (data) => (data ? false : 100),
    onError,
  });

  return queryResult;
}
