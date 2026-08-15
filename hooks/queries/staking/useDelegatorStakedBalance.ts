import { useQuery } from "@tanstack/react-query";
import { stakedBalanceKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getStakedBalance } from "web3";

export function useDelegatorStakedBalance(
  delegatorAddress: string | undefined
) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const queryResult = useQuery({
    queryKey: [stakedBalanceKey, delegatorAddress],
    queryFn: () => getStakedBalance(voting, delegatorAddress),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
