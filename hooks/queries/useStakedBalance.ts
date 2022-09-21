import { useQuery } from "@tanstack/react-query";
import { stakedBalanceKey } from "constants/queryKeys";
import { BigNumber } from "ethers";
import { useContractsContext } from "hooks/contexts";
import { getStakedBalance } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useStakedBalance() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const queryResult = useQuery([stakedBalanceKey], () => getStakedBalance(voting, address), {
    refetchInterval: (data) => (data ? false : 100),
    enabled: !!address,
    initialData: BigNumber.from(0),
  });

  return queryResult;
}
