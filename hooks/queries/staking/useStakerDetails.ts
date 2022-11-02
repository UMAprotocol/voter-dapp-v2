import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constant/queryKeys";
import { BigNumber } from "ethers";
import { zeroAddress } from "helpers";
import { useAccountDetails, useContractsContext, useDelegationContext, useHandleError } from "hooks";
import { getStakerDetails } from "web3";

export function useStakerDetails() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { getDelegationStatus, getDelegatorAddress } = useDelegationContext();
  const onError = useHandleError();

  const status = getDelegationStatus();
  const delegatorAddress = getDelegatorAddress();

  const addressToQuery = status === "delegate" && delegatorAddress ? delegatorAddress : address;

  const queryResult = useQuery([stakerDetailsKey, address], () => getStakerDetails(voting, addressToQuery), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    initialData: {
      stakedBalance: BigNumber.from(0),
      pendingUnstake: BigNumber.from(0),
      unstakeRequestTime: new Date(0),
      canUnstakeTime: new Date(0),
      delegate: zeroAddress,
    },
    onError,
  });

  return queryResult;
}
