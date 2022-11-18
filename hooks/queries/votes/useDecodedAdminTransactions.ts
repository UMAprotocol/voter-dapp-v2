import { useQuery } from "@tanstack/react-query";
import { decodedAdminTransactionsKey } from "constant";
import {
  useActiveVotes,
  useHandleError,
  usePastVotes,
  useUpcomingVotes,
} from "hooks";
import { getDecodedAdminTransactions } from "web3";

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
    initialData: {},
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
