import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constant";
import { useContractsContext, useHandleError, useWalletContext } from "hooks";
import { getStakerDetails } from "web3";

export function useStakerDetails(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  return useQuery({
    queryKey: [stakerDetailsKey, address],
    queryFn: () => getStakerDetails(voting, address),
    enabled: !isWrongChain,
    onError,
  });
}
