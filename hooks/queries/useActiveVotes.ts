import { useQuery } from "@tanstack/react-query";
import { activeVotesKey } from "constants/queryKeys";
import { decodeHexString } from "helpers/decodeHexString";
import { makeUniqueKeyForVote } from "helpers/votes";
import { useContractsContext } from "hooks/contexts";
import { ActiveVotesByKeyT } from "types/global";
import { getPendingRequests } from "web3/queries";

export default function useActiveVotes() {
  const { voting } = useContractsContext();

  const { isLoading, isError, data, error } = useQuery([activeVotesKey], () => getPendingRequests(voting), {
    refetchInterval(data) {
      return data?.length ? false : 1000;
    },
  });

  const pendingRequests = data?.[0];
  const activeVotes: ActiveVotesByKeyT = {};

  pendingRequests?.forEach(({ time, identifier, ancillaryData }) => {
    activeVotes[makeUniqueKeyForVote(identifier, time.toNumber(), ancillaryData)] = {
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
    };
  });

  return {
    activeVotes,
    activeVotesIsLoading: isLoading,
    activeVotesIsError: isError,
    activeVotesError: error,
  };
}
