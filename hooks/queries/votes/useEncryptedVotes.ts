import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";
import { getEncryptedVotes } from "web3";

export function useEncryptedVotes(roundId?: number) {
  const { voting, votingV1 } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [encryptedVotesKey, address, roundId],
    queryFn: () => getEncryptedVotes(voting, votingV1, address, roundId),
    enabled: !!address && !isWrongChain,
    onError,
  });

  return queryResult;
}
