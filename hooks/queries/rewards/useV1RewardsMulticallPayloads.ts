import { useQuery } from "@tanstack/react-query";
import { useSetChain } from "@web3-onboard/react";
import { v1RewardsMulticallPayloadsKey } from "constant";
import { useHandleError } from "hooks/helpers/useHandleError";
import { MainnetOrGoerli } from "types";
import { getV1RewardsMulticallPayloads } from "web3";
import { useAccountDetails } from "../user/useAccountDetails";

export function useV1RewardsMulticallPayloads() {
  const { address } = useAccountDetails();
  const [{ connectedChain }] = useSetChain();
  const { onError, clearErrors } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [v1RewardsMulticallPayloadsKey, address, connectedChain],
    queryFn: () =>
      getV1RewardsMulticallPayloads(
        address,
        Number(connectedChain?.id ?? 1) as MainnetOrGoerli
      ),
    initialData: [],
    enabled:
      !!address &&
      !!connectedChain &&
      (connectedChain.id === "1" || connectedChain.id === "5"),
    onError,
    onSuccess: clearErrors,
  });

  return queryResult;
}
