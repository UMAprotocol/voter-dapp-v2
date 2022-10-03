import { useQuery } from "@tanstack/react-query";
import { userDataKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { getUserData } from "graph";
import { useAccountDetails, useHandleError } from "hooks";

export function useUserVotingAndStakingDetails() {
  const { address } = useAccountDetails();
  const onError = useHandleError();

  const queryResult = useQuery([userDataKey, address], () => getUserData(address), {
    enabled: !!address,
    refetchInterval: (data) => (data ? false : 100),
    initialData: {
      apr: BigNumber.from(0),
      countReveals: 0,
      countNoVotes: 0,
      countWrongVotes: 0,
      countCorrectVotes: 0,
      cumulativeCalculatedSlash: BigNumber.from(0),
      cumulativeCalculatedSlashPercentage: BigNumber.from(0),
      voteHistoryByKey: {},
    },
    onError,
  });

  return queryResult;
}
