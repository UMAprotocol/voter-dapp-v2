import { useQuery } from "@tanstack/react-query";
import { isOldDesignatedVotingAccountKey } from "constant";
import { useHandleError, useWalletContext } from "hooks";
import { getIsOldDesignatedVotingAccount } from "web3";

export function useIsOldDesignatedVotingAccount(address: string | undefined) {
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [isOldDesignatedVotingAccountKey, address],
    queryFn: () => getIsOldDesignatedVotingAccount(address),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
