import { useQuery } from "@tanstack/react-query";
import { getCommittedVotes } from "chain";
import { committedVotesKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";

export function useCommittedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [committedVotesKey, address, roundId],
    () => getCommittedVotes(voting, address, roundId),
    {
      enabled: !!address && !isWrongChain,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
