import { useQuery } from "@tanstack/react-query";
import { revealedVotesKey } from "constants/queryKeys";
import { makeUniqueKeyForVote } from "helpers/votes";
import { useContractsContext } from "hooks/contexts";
import { VoteExistsByKeyT } from "types/global";
import { getVotesRevealedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useRevealedVotes() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [revealedVotesKey],
    () => getVotesRevealedByUser(voting, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const revealedVotes: VoteExistsByKeyT = {};

  eventData?.forEach(({ identifier, time, ancillaryData }) => {
    revealedVotes[makeUniqueKeyForVote(identifier, time, ancillaryData)] = true;
  });

  return {
    revealedVotes,
    revealedVotesIsLoading: isLoading,
    revealedVotesIsError: isError,
    revealedVotesError: error,
  };
}
