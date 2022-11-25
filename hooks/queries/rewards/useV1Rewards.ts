import { useQuery } from "@tanstack/react-query";
import { useSetChain } from "@web3-onboard/react";
import { v1RewardsMulticallPayloadsKey } from "constant";
import { BigNumber } from "ethers";
import { useHandleError } from "hooks/helpers/useHandleError";
import { MainnetOrGoerli } from "types";
import { getV1Rewards } from "web3";
import { useAccountDetails } from "../user/useAccountDetails";

export function useV1Rewards() {
  const { address } = useAccountDetails();
  const [{ connectedChain }] = useSetChain();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [v1RewardsMulticallPayloadsKey, address, connectedChain],
    queryFn: () =>
      getV1Rewards(address, Number(connectedChain?.id ?? 1) as MainnetOrGoerli),
    initialData: { multicallPayload: [], totalRewards: BigNumber.from(0) },
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
