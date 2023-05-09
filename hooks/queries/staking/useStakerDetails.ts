import { useQuery } from "@tanstack/react-query";
import { stakerDetailsKey } from "constant";
import { BigNumber } from "ethers";
import { zeroAddress } from "helpers";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";
import { getStakerDetails } from "web3";

const initialData = {
  pendingUnstake: BigNumber.from(0),
  canUnstakeTime: new Date(0),
  delegate: zeroAddress,
  rewardsPaidPerToken: BigNumber.from(0),
  outstandingRewards: BigNumber.from(0),
};

export function useStakerDetails(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;
  return useQuery({
    queryKey: [stakerDetailsKey, address],
    queryFn: () => (address ? getStakerDetails(voting, address) : initialData),
    enabled: !!address && !isWrongChain,
    initialData,
    onError,
  });
}
