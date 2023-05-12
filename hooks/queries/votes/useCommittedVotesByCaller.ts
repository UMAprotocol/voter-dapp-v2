import { useQuery } from "@tanstack/react-query";
import { committedVotesKeyByCaller } from "constant";
import {
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { getCommittedVotesByCaller } from "web3";

export function useCommittedVotesByCaller(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [committedVotesKeyByCaller, address, roundId],
    queryFn: () => getCommittedVotesByCaller(voting, address, roundId),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
