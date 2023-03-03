import { useQuery } from "@tanstack/react-query";
import { getDecodedAdminTransactions } from "chain";
import { decodedAdminTransactionsKey } from "constant";
import { useActiveVotes, usePastVotes, useUpcomingVotes } from "hooks";

export function useDecodedAdminTransactions() {
  const {
    data: { activeVotes },
  } = useActiveVotes();
  const {
    data: { upcomingVotes },
  } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();

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
  });

  return queryResult;
}
