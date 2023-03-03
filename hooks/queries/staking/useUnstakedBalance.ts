import { useQuery } from "@tanstack/react-query";
import { getUnstakedBalance } from "chain";
import { unstakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";

const initialData = BigNumber.from(0);

export function useUnstakedBalance(addressOverride?: string) {
  const { votingToken } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery(
    [unstakedBalanceKey, address],
    () => (address ? getUnstakedBalance(votingToken, address) : initialData),
    {
      enabled: !!address && !isWrongChain,
      onError,
      initialData,
    }
  );

  return queryResult;
}
