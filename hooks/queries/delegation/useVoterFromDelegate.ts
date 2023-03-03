import { useQuery } from "@tanstack/react-query";
import { getVoterFromDelegate } from "chain";
import { voterFromDelegateKey } from "constant";
import { useContractsContext, useUserContext, useWalletContext } from "hooks";

export function useVoterFromDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();

  const queryResult = useQuery(
    [voterFromDelegateKey, address],
    () => getVoterFromDelegate(voting, address),
    {
      enabled: !!address && !isWrongChain,
    }
  );

  return queryResult;
}
