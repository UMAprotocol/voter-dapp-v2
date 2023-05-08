import { useQuery } from "@tanstack/react-query";
import { isOldDesignatedVotingAccountKey } from "constant";
import { useAccountDetails, useHandleError, useWalletContext } from "hooks";
import { getIsOldDesignatedVotingAccount } from "web3";

export function useIsOldDesignatedVotingAccount() {
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [isOldDesignatedVotingAccountKey, address],
    queryFn: () => getIsOldDesignatedVotingAccount(address),
    enabled: !!address && !isWrongChain,
    onError,
  });

  return queryResult;
}
