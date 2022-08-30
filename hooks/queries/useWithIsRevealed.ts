import { useQuery } from "@tanstack/react-query";
import { withIsRevealedKey } from "constants/queryKeys";
import { makeUniqueKeyForVote } from "helpers/votes";
import { useContractsContext } from "hooks/contexts";
import { VoteExistsByKeyT } from "types/global";
import { getVotesRevealedByUser } from "web3/queries";
import useAccountDetails from "./useAccountDetails";

export default function useWithIsRevealed() {
  const { voting } = useContractsContext();
  const { address } = useAccountDetails();

  const { isLoading, isError, data, error } = useQuery(
    [withIsRevealedKey],
    () => getVotesRevealedByUser(voting, address),
    {
      refetchInterval: (data) => (data ? false : 1000),
      enabled: !!address,
    }
  );

  const eventData = data?.map(({ args }) => args);
  const withIsRevealed: VoteExistsByKeyT = {};

  eventData?.forEach(({ identifier, time, ancillaryData }) => {
    withIsRevealed[makeUniqueKeyForVote(identifier, time, ancillaryData)] = true;
  });

  return {
    withIsRevealed,
    withIsRevealedIsLoading: isLoading,
    withIsRevealedIsError: isError,
    withIsRevealedError: error,
  };
}
