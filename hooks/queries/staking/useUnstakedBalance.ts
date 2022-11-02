import { useQuery } from "@tanstack/react-query";
import { unstakedBalanceKey } from "constant";
import { useAccountDetails, useContractsContext, useHandleError } from "hooks";
import { getUnstakedBalance } from "web3";

export function useUnstakedBalance() {
  const { votingToken } = useContractsContext();
  const { address } = useAccountDetails();
  const onError = useHandleError();

  const queryResult = useQuery([unstakedBalanceKey, address], () => getUnstakedBalance(votingToken, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    onError,
  });

  return queryResult;
}
