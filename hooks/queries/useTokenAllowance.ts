import { useQuery } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getTokenAllowance } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useTokenAllowance() {
  const { votingToken } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [tokenAllowanceKey],
    () => getTokenAllowance(votingToken, address),
    {
      refetchInterval(data) {
        return data ? false : 100;
      },
    }
  );

  return {
    tokenAllowance: data,
    tokenAllowanceIsLoading: isLoading,
    tokenAllowanceIsError: isError,
    tokenAllowanceError: error,
  };
}
