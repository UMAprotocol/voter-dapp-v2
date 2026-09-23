import { useQuery } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getTokenAllowance } from "web3";

export function useTokenAllowance(address: string | undefined) {
  const { votingTokenWriter } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [tokenAllowanceKey, address],
    queryFn: () => getTokenAllowance(votingTokenWriter, address),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
