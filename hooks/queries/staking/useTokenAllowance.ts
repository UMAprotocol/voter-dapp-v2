import { useQuery } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useContractsContext, useHandleError } from "hooks";
import { getTokenAllowance } from "web3";

export function useTokenAllowance() {
  const { votingToken } = useContractsContext();
  const { address } = useAccountDetails();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [tokenAllowanceKey, address],
    () => getTokenAllowance(votingToken, address),
    {
      enabled: !!address,
      initialData: BigNumber.from(0),
      onError,
    }
  );

  return queryResult;
}
