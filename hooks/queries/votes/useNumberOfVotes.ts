import { useQuery } from "@tanstack/react-query";
import { numberOfVotesKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts/useContractsContext";
import { getNumberOfVotes } from "web3";

export function useNumberOfVotes() {
  const { voting } = useContractsContext();

  const queryResult = useQuery([numberOfVotesKey], () => getNumberOfVotes(voting));

  return queryResult;
}
