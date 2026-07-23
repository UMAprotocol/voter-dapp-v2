import { useQuery } from "@tanstack/react-query";
import { decodedAdminTransactionsKey } from "constant";
import { useActiveVotes, usePastVotes, useUpcomingVotes } from "hooks";
import { getDecodedAdminTransactions } from "web3";

export function useDecodedAdminTransactions() {
  const { data: activeVotes } = useActiveVotes();
  const { data: upcomingVotes } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();

  const governanceVoteIdentifiers = Object.entries({
    ...activeVotes,
    ...upcomingVotes,
    ...pastVotes,
  }).flatMap(([_id, { decodedIdentifier }]) => {
    return decodedIdentifier.includes("Admin") ? decodedIdentifier : [];
  });

  const queryResult = useQuery({
    // key only on the derived identifiers — keying on the full vote maps
    // serializes the entire vote history on every render just to compare keys
    queryKey: [decodedAdminTransactionsKey, governanceVoteIdentifiers],
    queryFn: () => getDecodedAdminTransactions(governanceVoteIdentifiers),
    enabled: governanceVoteIdentifiers.length > 0,
    // decoded admin transactions are immutable once proposed
    staleTime: Infinity,
  });

  return queryResult;
}
