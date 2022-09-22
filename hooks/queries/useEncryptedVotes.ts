import { useQuery } from "@tanstack/react-query";
import { encryptedVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import { getEncryptedVotesForUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useEncryptedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();

  const queryResult = useQuery(
    [encryptedVotesKey, address, roundId],
    () => getEncryptedVotesForUser(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      initialData: {},
    }
  );

  return queryResult;
}
