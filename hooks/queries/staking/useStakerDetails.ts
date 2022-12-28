import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constant";
import { BigNumber } from "ethers";
import { zeroAddress } from "helpers";
import { useAccountDetails, useContractsContext, useHandleError } from "hooks";
import { getStakerDetails } from "web3";

const initialData = {
  pendingUnstake: BigNumber.from(0),
  unstakeRequestTime: new Date(0),
  canUnstakeTime: new Date(0),
  delegate: zeroAddress,
  rewardsPaidPerToken: BigNumber.from(0),
};

export function useStakerDetails(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;
  return useQuery(
    [stakerDetailsKey, address],
    () => (address ? getStakerDetails(voting, address) : initialData),
    {
      enabled: !!address,
      initialData,
      onError,
    }
  );
}
