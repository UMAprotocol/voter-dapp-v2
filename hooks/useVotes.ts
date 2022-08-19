import getVoteMetaData from "helpers/getVoteMetaData";
import { PriceRequestT, VoteT } from "types/global";
import useActiveVotes from "./useActiveVotes";
import { useContractsContext } from "./useContractsContext";
import useCurrentRoundId from "./useCurrentRoundId";
import { useWalletContext } from "./useWalletContext";
import useWithDecryptedVotes from "./useWithDecryptedVotes";
import useWithEncryptedVotes from "./useWithEncryptedVotes";
import useWithIsCommitted from "./useWithIsCommitted";
import useWithIsRevealed from "./useWithIsRevealed";

export default function useVotes(address: string | undefined) {
  const { voting } = useContractsContext();
  const { signingKeys } = useWalletContext();
  const { activeVotes } = useActiveVotes(voting);
  const { currentRoundId } = useCurrentRoundId(voting);

  const { withIsCommitted } = useWithIsCommitted(voting, address, activeVotes);
  const { withIsRevealed } = useWithIsRevealed(voting, address, withIsCommitted);

  const { withEncryptedVotes } = useWithEncryptedVotes(voting, address, currentRoundId, withIsRevealed);
  const withDecryptedVotes = useWithDecryptedVotes(withEncryptedVotes, address, signingKeys);

  const withMetaData = addMetaData(withDecryptedVotes) as VoteT[];

  return withMetaData;
}

function addMetaData(votes: PriceRequestT[]) {
  return votes.map((vote) => {
    const { decodedIdentifier, decodedAncillaryData, transactionHash } = vote;
    const voteMetaData = getVoteMetaData(decodedIdentifier, decodedAncillaryData, transactionHash);
    return {
      ...vote,
      ...voteMetaData,
    };
  });
}
