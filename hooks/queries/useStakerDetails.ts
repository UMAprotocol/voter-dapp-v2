import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts";
import { getStakerDetails } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useStakerDetails() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const queryResult = useQuery([stakerDetailsKey, address], () => getStakerDetails(voting, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    initialData: {
      pendingUnstake: BigNumber.from(0),
      unstakeRequestTime: new Date(0),
      canUnstakeTime: new Date(0),
    },
  });

  return queryResult;
}
