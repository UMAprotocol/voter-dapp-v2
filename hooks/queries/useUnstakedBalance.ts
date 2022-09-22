import { useQuery } from "@tanstack/react-query";
import { unstakedBalanceKey } from "constants/queryKeys";
import { useContractsContext } from "hooks/contexts";
import { getUnstakedBalance } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useUnstakedBalance() {
  const { votingToken } = useContractsContext();
  const { address } = useAccountDetails();

  const queryResult = useQuery([unstakedBalanceKey, address], () => getUnstakedBalance(votingToken, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
  });

  return queryResult;
}
