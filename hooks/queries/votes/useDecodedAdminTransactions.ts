import { useQuery } from "@tanstack/react-query";
import { decodedAdminTransactionsKey } from "constant";
import { useHandleError } from "hooks/helpers/useHandleError";
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
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const governanceVoteIdentifiers = Object.entries({
    ...activeVotes,
    ...upcomingVotes,
    ...pastVotes,
  }).flatMap(([_id, { decodedIdentifier }]) => {
    return decodedIdentifier.includes("Admin") ? decodedIdentifier : [];
  });

  const queryResult = useQuery({
    queryKey: [
      decodedAdminTransactionsKey,
      activeVotes,
      upcomingVotes,
      pastVotes,
    ],
    queryFn: () => getDecodedAdminTransactions(governanceVoteIdentifiers),
    initialData: [],
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
