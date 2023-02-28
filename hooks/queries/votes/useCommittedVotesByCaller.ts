import { useQuery } from "@tanstack/react-query";
import { committedVotesKeyByCaller } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { getCommittedVotesByCaller } from "web3";

export function useCommittedVotesByCaller() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [committedVotesKeyByCaller, address, roundId],
    () => getCommittedVotesByCaller(voting, address, roundId),
    {
      enabled: !!address && !isWrongChain,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
