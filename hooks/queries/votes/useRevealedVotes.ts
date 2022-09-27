import { useQuery } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { useAccountDetails, useContractsContext, useHandleError, useVoteTimingContext } from "hooks";
import { getRevealedVotes } from "web3";

export function useRevealedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([revealedVotesKey, address, roundId], () => getRevealedVotes(voting, address, roundId), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    initialData: {},
    onError,
  });

  return queryResult;
}
