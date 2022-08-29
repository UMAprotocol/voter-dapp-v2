import getVoteMetaData from "helpers/getVoteMetaData";
import { useContractsContext, useWalletContext } from "hooks/contexts";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import {
  useActiveVotes,
  useWithDecryptedVotes,
  useWithEncryptedVotes,
  useWithIsCommitted,
  useWithIsRevealed,
  useWithUmipDataFromContentful,
} from "hooks/queries";
import { PriceRequestT, VoteT, WithUmipDataFromContentfulT } from "types/global";

export default function useVotes(address: string | undefined) {
  const { voting } = useContractsContext();
  const { signingKeys } = useWalletContext();
  const { activeVotes } = useActiveVotes(voting);
  const { roundId } = useVoteTimingContext();

  const { withIsRevealed } = useWithIsRevealed(voting, address, activeVotes);
  const { withIsCommitted } = useWithIsCommitted(voting, address, withIsRevealed);
  const { withEncryptedVotes } = useWithEncryptedVotes(voting, address, roundId, withIsCommitted);
  const withDecryptedVotes = useWithDecryptedVotes(withEncryptedVotes, address, signingKeys);

  const { withUmipDataFromContentful } = useWithUmipDataFromContentful(withDecryptedVotes);
  const withMetaData = addMetaData(withUmipDataFromContentful);

  return withMetaData as VoteT[];
}

function addMetaData(votes: WithUmipDataFromContentfulT<PriceRequestT>[]) {
  return votes.map((vote) => {
    const { decodedIdentifier, decodedAncillaryData, transactionHash, umipDataFromContentful } = vote;
    const voteMetaData = getVoteMetaData(
      decodedIdentifier,
      decodedAncillaryData,
      transactionHash,
      umipDataFromContentful
    );
    return {
      ...vote,
      ...voteMetaData,
    };
  });
}
