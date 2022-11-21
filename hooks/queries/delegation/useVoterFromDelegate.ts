import { useQuery } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constant";
import { useContractsContext, useUserContext } from "hooks";
import { getVoterFromDelegate } from "web3";

export function useVoterFromDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();

  const queryResult = useQuery(
    [voterFromDelegateKey, address],
    () => getVoterFromDelegate(voting, address),
    {
      enabled: !!address,
    }
  );

  return queryResult;
}
