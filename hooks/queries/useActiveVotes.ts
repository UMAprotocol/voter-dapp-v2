import { useQuery } from "@tanstack/react-query";
import { activeVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { useHandleError } from "hooks/helpers";
import { getPendingRequests } from "web3/queries";

export default function useActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery([activeVotesKey, roundId], () => getPendingRequests(voting), {
    refetchInterval: (data) => (data ? false : 100),
    initialData: {},
    onError,
  });

  return queryResult;
}
