import { useQuery } from "@tanstack/react-query";
import { getActiveVotes } from "chain";
import { activeVotesKey, oneSecond, phaseLengthMilliseconds } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";

export function useActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();

  const shouldRefetch =
    phase === "commit" &&
    phaseLengthMilliseconds - millisecondsUntilPhaseEnds < 30 * oneSecond;

  const queryResult = useQuery(
    [activeVotesKey, roundId],
    () => getActiveVotes(voting),
    {
      refetchInterval: shouldRefetch ? 1000 : false,
      initialData: {
        activeVotes: {},
        hasActiveVotes: false,
      },
      enabled: !isWrongChain,
      onError,
    }
  );

  return queryResult;
}
