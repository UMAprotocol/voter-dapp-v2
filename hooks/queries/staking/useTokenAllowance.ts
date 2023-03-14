import { useQuery } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constant";
import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";
import { getTokenAllowance } from "web3";

export function useTokenAllowance() {
  const { votingTokenWriter } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery(
    [tokenAllowanceKey, address],
    () => getTokenAllowance(votingTokenWriter!, address),
    {
      enabled: !!address && !isWrongChain && !!votingTokenWriter,
      initialData: BigNumber.from(0),
      onError,
    }
  );

  return queryResult;
}
