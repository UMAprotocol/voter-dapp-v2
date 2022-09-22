import { useQuery } from "@tanstack/react-query";
import { committedVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { getVotesCommittedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useCommittedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();

  const queryResult = useQuery(
    [committedVotesKey, address, roundId],
    () => getVotesCommittedByUser(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      initialData: {},
    }
  );

  return queryResult;
}
