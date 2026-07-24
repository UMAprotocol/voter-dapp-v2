import { useQuery } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constant";
import { useContractsContext, useWalletContext } from "hooks";
import { getVoterFromDelegate } from "web3";

export function useVoterFromDelegate(address: string | undefined) {
  const { voting } = useContractsContext();
  const { isWrongChain } = useWalletContext();

  const queryResult = useQuery({
    queryKey: [voterFromDelegateKey, address],
    queryFn: () => getVoterFromDelegate(voting, address),
    enabled: !isWrongChain,
  });

  return queryResult;
}
