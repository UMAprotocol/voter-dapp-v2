import { useQuery } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constant";
import { useContractsContext, useUserContext, useWalletContext } from "hooks";
import { getVoterFromDelegate } from "web3";

export function useVoterFromDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();

  const queryResult = useQuery({
    queryKey: [voterFromDelegateKey, address],
    queryFn: () => getVoterFromDelegate(voting, address),
    enabled: !!address && !isWrongChain,
  });

  return queryResult;
}
