import { useQuery } from "@tanstack/react-query";
import { isOldDesignatedVotingAccountKey } from "constant";
import { useAccountDetails, useHandleError } from "hooks";
import { getIsOldDesignatedVotingAccount } from "web3";

export function useIsOldDesignatedVotingAccount() {
  const { address } = useAccountDetails();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [isOldDesignatedVotingAccountKey, address],
    queryFn: () => getIsOldDesignatedVotingAccount(address),
    initialData: {
      isOldDesignatedVotingAccount: false,
      message: "",
      designatedVotingContract: "",
    },
    enabled: !!address,
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
