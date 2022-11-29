import { useQuery } from "@tanstack/react-query";
import { useSetChain } from "@web3-onboard/react";
import { v1RewardsKey } from "constant";
import { BigNumber } from "ethers";
import { useAccountDetails, useHandleError } from "hooks";
import { MainnetOrGoerli } from "types";
import { getV1Rewards } from "web3";

export function useV1Rewards() {
  const { address } = useAccountDetails();
  const [{ connectedChain }] = useSetChain();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [v1RewardsKey, address, connectedChain],
    queryFn: () =>
      getV1Rewards(address, Number(connectedChain?.id ?? 1) as MainnetOrGoerli),
    initialData: { multicallPayload: [], totalRewards: BigNumber.from(0) },
    enabled: !!address && !!connectedChain,
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
