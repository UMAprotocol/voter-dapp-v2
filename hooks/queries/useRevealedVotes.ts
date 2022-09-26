import { useQuery } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { useContractsContext, useVoteTimingContext } from "hooks/contexts";
import useHandleError from "hooks/helpers/useHandleError";
import { getVotesRevealedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useRevealedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const onError = useHandleError();

  const queryResult = useQuery(
    [revealedVotesKey, address, roundId],
    () => getVotesRevealedByUser(voting, address, roundId),
    {
      refetchInterval: (data) => (data ? false : 100),
      enabled: !!address,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
