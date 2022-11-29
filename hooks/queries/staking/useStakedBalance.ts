import { useQuery } from "@tanstack/react-query";
import { stakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { getStakedBalance } from "web3";
import { useAccountDetails } from "../user/useAccountDetails";

export function useStakedBalance() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [stakedBalanceKey, address],
    queryFn: () => getStakedBalance(voting, address),
    enabled: !!address,
    initialData: BigNumber.from(0),
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
