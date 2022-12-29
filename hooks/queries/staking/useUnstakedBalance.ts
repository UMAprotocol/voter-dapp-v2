import { useQuery } from "@tanstack/react-query";
import { unstakedBalanceKey } from "constant";
import { useAccountDetails, useContractsContext, useHandleError } from "hooks";
import { getUnstakedBalance } from "web3";
import { BigNumber } from "ethers";

const initialData = BigNumber.from(0);

export function useUnstakedBalance(addressOverride?: string) {
  const { votingToken } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery(
    [unstakedBalanceKey, address],
    () => (address ? getUnstakedBalance(votingToken, address) : initialData),
    {
      enabled: !!address,
      onError,
      initialData,
    }
  );

  return queryResult;
}
