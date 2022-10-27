import { useQuery } from "@tanstack/react-query";
import { voterFromDelegateKey } from "constants/queryKeys";
import { useContractsContext, useUserContext } from "hooks";
import { getVoterFromDelegate } from "web3";

export function useVoterFromDelegate() {
  const { voting } = useContractsContext();
  const { address } = useUserContext();

  const queryResult = useQuery([voterFromDelegateKey, address], () => getVoterFromDelegate(voting, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
  });

  return queryResult;
}
