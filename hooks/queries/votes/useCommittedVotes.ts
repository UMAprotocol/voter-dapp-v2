import { useQuery } from "@tanstack/react-query";
import { committedVotesKey } from "constants/queryKeys";
import { useAccountDetails, useContractsContext, useHandleError, useVoteTimingContext } from "hooks";
import { getCommittedVotes } from "web3";

export function useCommittedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [committedVotesKey, address, roundId],
    () => getCommittedVotes(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
