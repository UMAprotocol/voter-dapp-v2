import { useQuery } from "@tanstack/react-query";
import { getRevealedVotes } from "chain";
import { revealedVotesKey } from "constant";
import {
  useAccountDetails,
  useContractsContext,
  useHandleError,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";

export function useRevealedVotes(addressOverride?: string) {
  const { voting } = useContractsContext();
  const { address: myAddress } = useAccountDetails();
  const { isWrongChain } = useWalletContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });
  const address = addressOverride ?? myAddress;

  const queryResult = useQuery(
    [revealedVotesKey, address, roundId],
    () => getRevealedVotes(voting, address, roundId),
    {
      enabled: !!address && !isWrongChain,
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
