import { useQuery } from "@tanstack/react-query";
import { activeVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { getPendingRequests } from "web3/queries";

export default function useActiveVotes() {
  const { voting } = useContractsContext();
  const { roundId } = useVoteTimingContext();

  const queryResult = useQuery([activeVotesKey, roundId], () => getPendingRequests(voting), {
    refetchInterval: (data) => (data ? false : 100),
  });

  return queryResult;
}
