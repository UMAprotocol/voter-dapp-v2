import { useQuery } from "@tanstack/react-query";
import { revealedVotesKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
} from "hooks";
import { getRevealedVotes } from "web3";

export function useRevealedVotes(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: myAddress } = useAccountDetails();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride ?? myAddress;

  const queryResult = useQuery(
    [revealedVotesKey, address, roundId],
    () => getRevealedVotes(voting, address, roundId),
    {
      enabled: !!address,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
