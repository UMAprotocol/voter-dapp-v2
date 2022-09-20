import { useQuery } from "@tanstack/react-query";
import { pastVotesKey } from "constants/queryKeys";
import { formatBytes32String, formatEther } from "ethers/lib/utils";
import { getPastVotes } from "graph/queries";
import makePriceRequestsByKey from "helpers/makePriceRequestsByKey";
import { PastVotesQuery } from "types/global";

export default function usePastVotes() {
  const { isLoading, isError, data, error } = useQuery<PastVotesQuery>([pastVotesKey], () => getPastVotes(), {
    refetchInterval(data) {
      return data ? false : 100;
    },
  });

  const parsedData = data?.priceRequests?.map(({ id, time, price, ancillaryData }) => {
    const identifier = getIdentifierFromPriceRequestId(id);
    const correctVote = Number(formatEther(price));

    return {
      identifier,
      time: Number(time),
      correctVote,
      ancillaryData,
    };
  });

  const pastVotes = makePriceRequestsByKey(parsedData ?? []);

  return {
    pastVotes,
    pastVotesIsLoading: isLoading,
    pastVotesIsError: isError,
    pastVotesError: error,
  };
}

function getIdentifierFromPriceRequestId(priceRequestId: string) {
  return formatBytes32String(priceRequestId.split("-")[0]);
}
