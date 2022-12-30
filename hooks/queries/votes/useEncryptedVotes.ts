import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constant";
import { useAccountDetails, useContractsContext, useHandleError } from "hooks";
import { getEncryptedVotes } from "web3";

export function useEncryptedVotes(roundId?: number) {
  const { voting, votingV1 } = useContractsContext();
  const { address } = useAccountDetails();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [encryptedVotesKey, address, roundId],
    () => getEncryptedVotes(voting, votingV1, address, roundId),
    {
      enabled: !!address,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
