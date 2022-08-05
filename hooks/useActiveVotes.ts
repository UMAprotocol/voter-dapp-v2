import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString } from "helpers/decodeHexString";
import { PriceRequest } from "types/global";
import getPendingRequests from "web3/queries/getPendingRequests";

export default function useActiveVotes(votingContract: VotingV2Ethers) {
  const { isLoading, isError, data, error } = useQuery(["activeVotes"], () => getPendingRequests(votingContract), {
    refetchInterval(data) {
      return data?.length ? 10000 : 1000;
    },
  });

  const pendingRequests = data?.[0];

  const activeVotes: PriceRequest[] | undefined = pendingRequests?.map(({ time, identifier, ancillaryData }) => ({
    time: time.toNumber(),
    identifier,
    ancillaryData,
    timeMilliseconds: time.toNumber() * 1000,
    decodedIdentifier: decodeHexString(identifier),
    decodedAncillaryData: decodeHexString(ancillaryData),
  }));

  return {
    activeVotes,
    activeVotesIsLoading: isLoading,
    activeVotesIsError: isError,
    activeVotesError: error,
  };
}
