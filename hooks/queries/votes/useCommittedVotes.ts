import { useQuery } from "@tanstack/react-query";
import { committedVotesKey } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { getCommittedVotes } from "web3";

export function useCommittedVotes(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [committedVotesKey, address, roundId],
    queryFn: () => getCommittedVotes(voting, address, roundId),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
