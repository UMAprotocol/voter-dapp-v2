import getVoteMetaData from "helpers/getVoteMetaData";
import { VoteT, PriceRequestT, WithIsGovernanceT, WithUmipDataFromContentfulT, WithMetaDataT } from "types/global";
import useActiveVotes from "./useActiveVotes";
import { useContractsContext } from "./useContractsContext";
import useCurrentRoundId from "./useCurrentRoundId";
import useWithUmipDataFromContentful from "./useWithUmipDataFromContentful";
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

  const withIsGovernance = addIsGovernance(activeVotes);

  const { withIsCommitted } = useWithIsCommitted(voting, address, withIsGovernance);
  const { withIsRevealed } = useWithIsRevealed(voting, address, withIsCommitted);

  const { withEncryptedVotes } = useWithEncryptedVotes(voting, address, currentRoundId, withIsRevealed);
  const withDecryptedVotes = useWithDecryptedVotes(withEncryptedVotes, address, signingKeys);

  const { withUmipDataFromContentful } = useWithUmipDataFromContentful(withDecryptedVotes);

  const withMetaData = addMetaData(withUmipDataFromContentful);

  return withMetaData as VoteT[];
}

function addIsGovernance(votes: PriceRequestT[]): WithIsGovernanceT[] {
  return votes.map((vote) => {
    const isGovernance = vote.decodedIdentifier.includes("Admin");
    return {
      ...vote,
      isGovernance,
    };
  });
}

function addMetaData(votes: WithUmipDataFromContentfulT[]) {
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
  }) as WithMetaDataT[];
}
