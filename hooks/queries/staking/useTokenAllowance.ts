import { useQuery } from "@tanstack/react-query";
import { getTokenAllowance } from "chain";
import { tokenAllowanceKey } from "constant";
import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";

export function useTokenAllowance() {
  const { votingToken } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [tokenAllowanceKey, address],
    () => getTokenAllowance(votingToken, address),
    {
      enabled: !!address && !isWrongChain,
      initialData: BigNumber.from(0),
      onError,
    }
  );

  return queryResult;
}
