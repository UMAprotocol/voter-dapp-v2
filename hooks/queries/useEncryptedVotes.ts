import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getEncryptedVotesForUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useEncryptedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [encryptedVotesKey],
    () => getEncryptedVotesForUser(voting, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  return {
    encryptedVotes: data ?? {},
    encryptedVotesIsLoading: isLoading,
    encryptedVotesIsError: isError,
    encryptedVotesError: error,
  };
}
