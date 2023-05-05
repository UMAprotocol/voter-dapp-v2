import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";
import { getStakerDetails } from "web3";

export function useStakerDetails(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;
  return useQuery(
    [stakerDetailsKey, address],
    () => getStakerDetails(voting, address),
    {
      enabled: !!address && !isWrongChain,
      onError,
    }
  );
}
