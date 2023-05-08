import { useQuery } from "@tanstack/react-query";
import { committedVotesKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { getCommittedVotes } from "web3";

export function useCommittedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [committedVotesKey, address, roundId],
    queryFn: () => getCommittedVotes(voting, address, roundId),
    enabled: !!address && !isWrongChain,
    onError,
  });

  return queryResult;
}
