import { useQuery } from "@tanstack/react-query";
import { stakedBalanceKey } from "constant";
import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { getStakedBalance } from "web3";
import { useAccountDetails } from "../user/useAccountDetails";

export function useStakedBalance(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery({
    queryKey: [stakedBalanceKey, address],
    queryFn: () => getStakedBalance(voting, address),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
