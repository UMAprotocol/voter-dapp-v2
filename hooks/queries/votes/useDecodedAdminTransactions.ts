import { useQuery } from "@tanstack/react-query";
import { decodedAdminTransactionsKey } from "constant";
import { getDecodedAdminTransactions } from "web3";
import { useActiveVotes } from "./useActiveVotes";
import { usePastVotes } from "./usePastVotes";
import { useUpcomingVotes } from "./useUpcomingVotes";

export function useDecodedAdminTransactions() {
  const { data: activeVotes } = useActiveVotes();
  const {
    data: { upcomingVotes },
  } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();
  const queryResult = useQuery({
    queryKey: [
      decodedAdminTransactionsKey,
      activeVotes,
      upcomingVotes,
      pastVotes,
    ],
    queryFn: () => getDecodedAdminTransactions(),
  });

  return queryResult;
}
