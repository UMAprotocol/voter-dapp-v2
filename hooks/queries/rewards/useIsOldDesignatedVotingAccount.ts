import { useQuery } from "@tanstack/react-query";
import { isOldDesignatedVotingAccountKey } from "constant";
import { useAccountDetails, useHandleError, useWalletContext } from "hooks";
import { getIsOldDesignatedVotingAccount } from "web3";

export function useIsOldDesignatedVotingAccount() {
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [isOldDesignatedVotingAccountKey, address],
    queryFn: () => getIsOldDesignatedVotingAccount(address),
    initialData: {
      isOldDesignatedVotingAccount: false,
      message: "",
      designatedVotingContract: "",
    },
    enabled: !!address && !isWrongChain,
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
