import { useQuery } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts";
import { useHandleError } from "hooks/helpers";
import { getTokenAllowance } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useTokenAllowance() {
  const { votingToken } = useContractsContext();
  const { address } = useAccountDetails();
  const onError = useHandleError();

  const queryResult = useQuery([tokenAllowanceKey, address], () => getTokenAllowance(votingToken, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    initialData: BigNumber.from(0),
    onError,
  });

  return queryResult;
}
