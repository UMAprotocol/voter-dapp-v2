import { useQuery } from "@tanstack/react-query";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString } from "helpers/decodeHexString";
import { makeUniqueKeyForVote } from "helpers/votes";
import { PriceRequestT } from "types/global";
import getPendingRequests from "web3/queries/getPendingRequests";

export default function useActiveVotes(votingContract: VotingV2Ethers) {
  const { isLoading, isError, data, error } = useQuery(["activeVotes"], () => getPendingRequests(votingContract), {
    refetchInterval(data) {
      return data?.length ? false : 1000;
    },
  });

  const pendingRequests = data?.[0];

  const activeVotes: PriceRequestT[] | undefined =
    pendingRequests?.map(({ time, identifier, ancillaryData }) => ({
      time: time.toNumber(),
      identifier,
      ancillaryData,
      // todo: replace with on chain value once getter is updated
      transactionHash: "0x5b80ae07dfec789436ce29ff8169907e6ad4dcf765244314fb3748d8c7042925",
      timeMilliseconds: time.toNumber() * 1000,
      timeAsDate: new Date(time.toNumber() * 1000),
      decodedIdentifier: decodeHexString(identifier),
      decodedAncillaryData: decodeHexString(ancillaryData),
      uniqueKey: makeUniqueKeyForVote(identifier, time.toNumber(), ancillaryData),
    })) ?? [];

  return {
    activeVotes,
    activeVotesIsLoading: isLoading,
    activeVotesIsError: isError,
    activeVotesError: error,
  };
}
