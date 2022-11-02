import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constant";
import { useAccountDetails, useContractsContext, useHandleError, useVoteTimingContext } from "hooks";
import { getEncryptedVotes } from "web3";

export function useEncryptedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [encryptedVotesKey, address, roundId],
    () => getEncryptedVotes(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
