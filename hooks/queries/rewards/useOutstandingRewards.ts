import { useQuery } from "@tanstack/react-query";
import { getOutstandingRewards } from "chain";
import { outstandingRewardsKey } from "constant";
import { BigNumber } from "ethers";
import {
  useContractsContext,
  useHandleError,
  useUserContext,
  useWalletContext,
} from "hooks";

export function useOutstandingRewards(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: defaultAddress } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride || defaultAddress;

  const queryResult = useQuery(
    [outstandingRewardsKey, address],
    () => getOutstandingRewards(voting, address),
    {
      enabled: !!address && !isWrongChain,
      initialData: BigNumber.from(0),
      onError,
    }
  );

  return queryResult;
}
