import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts";
import useHandleError from "hooks/helpers/useHandleError";
import { getStakerDetails } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useStakerDetails() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const onError = useHandleError();

  const queryResult = useQuery([stakerDetailsKey, address], () => getStakerDetails(voting, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    initialData: {
      stakedBalance: BigNumber.from(0),
      pendingUnstake: BigNumber.from(0),
      unstakeRequestTime: new Date(0),
      canUnstakeTime: new Date(0),
    },
    onError,
  });

  return queryResult;
}
