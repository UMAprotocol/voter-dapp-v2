import { useQuery } from "@tanstack/react-query";
import { stakedBalanceKey } from "constant";
import { useContractsContext } from "hooks/contexts/useContractsContext";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { getStakedBalance } from "web3";
import { useVoterFromDelegate } from "../delegation/useVoterFromDelegate";

export function useDelegatorStakedBalance() {
  const { voting } = useContractsContext();
  const { data: address } = useVoterFromDelegate();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const queryResult = useQuery({
    queryKey: [stakedBalanceKey, address],
    queryFn: () => getStakedBalance(voting, address),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
