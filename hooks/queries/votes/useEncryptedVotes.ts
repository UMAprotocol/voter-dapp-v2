import { useQuery } from "@tanstack/react-query";
import { getEncryptedVotes } from "chain";
import { encryptedVotesKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";

export function useEncryptedVotes(roundId?: number) {
  const { voting, votingV1 } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [encryptedVotesKey, address, roundId],
    () => getEncryptedVotes(voting, votingV1, address, roundId),
    {
      enabled: !!address && !isWrongChain,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
