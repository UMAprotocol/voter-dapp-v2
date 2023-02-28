import { useQuery } from "@tanstack/react-query";
import { stakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { getStakedBalance } from "web3";
import { useAccountDetails } from "../user/useAccountDetails";

const initialData = BigNumber.from(0);

export function useStakedBalance(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery({
    queryKey: [stakedBalanceKey, address],
    queryFn: () => (address ? getStakedBalance(voting, address) : initialData),
    enabled: !!address && !isWrongChain,
    initialData,
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
