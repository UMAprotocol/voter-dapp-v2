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
    queryKey: [
      decodedAdminTransactionsKey,
      activeVotes,
      upcomingVotes,
      pastVotes,
      governanceVoteIdentifiers,
    ],
    queryFn: () => getDecodedAdminTransactions(governanceVoteIdentifiers),
  });

  return queryResult;
}
