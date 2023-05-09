import { useQuery } from "@tanstack/react-query";
import { unstakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";
import { getUnstakedBalance } from "web3";

const initialData = BigNumber.from(0);

export function useUnstakedBalance(addressOverride?: string) {
  const { votingToken } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery({
    queryKey: [unstakedBalanceKey, address],
    queryFn: () =>
      address ? getUnstakedBalance(votingToken, address) : initialData,
    enabled: !!address && !isWrongChain,
    onError,
    initialData,
  });

  return queryResult;
}
