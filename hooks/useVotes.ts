import getVoteMetaData from "helpers/getVoteMetaData";
import { PriceRequestT, VoteT, WithUmipDataFromContentfulT } from "types/global";
import useActiveVotes from "./useActiveVotes";
import { useContractsContext } from "./useContractsContext";
import useCurrentRoundId from "./useCurrentRoundId";
import { useWalletContext } from "./useWalletContext";
import useWithDecryptedVotes from "./useWithDecryptedVotes";
import useWithEncryptedVotes from "./useWithEncryptedVotes";
import useWithIsCommitted from "./useWithIsCommitted";
import useWithIsRevealed from "./useWithIsRevealed";
import useWithUmipDataFromContentful from "./useWithUmipDataFromContentful";

export default function useVotes(address: string | undefined) {
  const { voting } = useContractsContext();
  const { signingKeys } = useWalletContext();
  const { activeVotes } = useActiveVotes(voting);
  const { currentRoundId } = useCurrentRoundId(voting);

  const { withIsRevealed } = useWithIsRevealed(voting, address, activeVotes);
  const { withIsCommitted } = useWithIsCommitted(voting, address, withIsRevealed);
  const { withEncryptedVotes } = useWithEncryptedVotes(voting, address, currentRoundId, withIsCommitted);
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
