import { useQuery } from "@tanstack/react-query";
import { getStakedBalance } from "chain";
import { stakedBalanceKey } from "constant";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { useVoterFromDelegate } from "../delegation/useVoterFromDelegate";

export function useDelegatorStakedBalance() {
  const { voting } = useContractsContext();
  const { data: address } = useVoterFromDelegate();
  const { isWrongChain } = useWalletContext();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });
  const queryResult = useQuery({
    queryKey: [stakedBalanceKey, address],
    queryFn: () =>
      address ? getStakedBalance(voting, address) : BigNumber.from(0),
    enabled: !!address && !isWrongChain,
    initialData: BigNumber.from(0),
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
