import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getEncryptedVotes } from "web3";

export function useEncryptedVotes(
  address: string | undefined,
  roundId?: number
) {
  const { voting, votingV1 } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [encryptedVotesKey, address, roundId],
    queryFn: () => getEncryptedVotes(voting, votingV1, address, roundId),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
