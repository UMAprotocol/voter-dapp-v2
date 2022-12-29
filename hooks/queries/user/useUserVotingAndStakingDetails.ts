import { useQuery } from "@tanstack/react-query";
import { oneMinute, userDataKey } from "constant";
import { BigNumber } from "ethers";
import { getUserData } from "graph";
import { useAccountDetails, useHandleError } from "hooks";

export function useUserVotingAndStakingDetails(addressOverride?: string) {
  const { address: defaultAddress } = useAccountDetails();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery(
    [userDataKey, address],
    () => getUserData(address),
    {
      enabled: !!address,
      refetchInterval: oneMinute,
      initialData: {
        apr: BigNumber.from(0),
        countReveals: BigNumber.from(0),
        countNoVotes: BigNumber.from(0),
        countWrongVotes: BigNumber.from(0),
        countCorrectVotes: BigNumber.from(0),
        cumulativeCalculatedSlash: BigNumber.from(0),
        cumulativeCalculatedSlashPercentage: BigNumber.from(0),
        voteHistoryByKey: {},
      },
      onError,
    }
  );

  return queryResult;
}
