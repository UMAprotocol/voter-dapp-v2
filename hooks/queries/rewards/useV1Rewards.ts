import { useQuery } from "@tanstack/react-query";
import { useSetChain } from "@web3-onboard/react";
import { v1RewardsKey } from "constant";
import { useAccountDetails, useHandleError, useWalletContext } from "hooks";
import { MainnetOrGoerli } from "types";
import { getV1Rewards } from "web3";

export function useV1Rewards() {
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const [{ connectedChain }] = useSetChain();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    queryKey: [v1RewardsKey, address, connectedChain?.id],
    queryFn: () =>
      getV1Rewards(address, Number(connectedChain?.id ?? 1) as MainnetOrGoerli),
    enabled: !isWrongChain,
    onError,
  });

  return queryResult;
}
