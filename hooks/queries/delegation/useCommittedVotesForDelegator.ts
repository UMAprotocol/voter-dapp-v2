import { useQuery } from "@tanstack/react-query";
import { getCommittedVotes } from "chain";
import { committedVotesForDelegatorKey, oneMinute } from "constant";
import {
  useContractsContext,
  useDelegationContext,
  useHandleError,
  useUserContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { VoteExistsByKeyT } from "types";

export function useCommittedVotesForDelegator() {
  const { address } = useUserContext();
  const { isWrongChain } = useWalletContext();
  const { voting } = useContractsContext();
  const { getDelegationStatus, getDelegatorAddress } = useDelegationContext();
  const { roundId } = useVoteTimingContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const status = getDelegationStatus();
  const delegatorAddress = getDelegatorAddress();

  const queryResult = useQuery(
    [committedVotesForDelegatorKey, address, delegatorAddress, roundId],
    async (): Promise<VoteExistsByKeyT> =>
      delegatorAddress
        ? getCommittedVotes(voting, delegatorAddress, roundId)
        : {},
    {
      refetchInterval: status === "delegate" ? oneMinute : false,
      enabled:
        !!address &&
        !isWrongChain &&
        !!delegatorAddress &&
        status === "delegate",
      initialData: {},
      onError,
    }
  );

  return queryResult;
}
