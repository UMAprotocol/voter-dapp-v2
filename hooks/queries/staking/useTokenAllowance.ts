import { useQuery } from "@tanstack/react-query";
import { tokenAllowanceKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useWalletContext,
} from "hooks";
import { getTokenAllowance } from "web3";

export function useTokenAllowance() {
  const { votingTokenWriter } = useContractsContext();
  const { address } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const queryResult = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [tokenAllowanceKey, address],
    queryFn: () => getTokenAllowance(votingTokenWriter, address),
    enabled: !!address && !isWrongChain && !!votingTokenWriter,
    onError,
  });

  return queryResult;
}
