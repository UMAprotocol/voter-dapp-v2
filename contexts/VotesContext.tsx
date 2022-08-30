import getVoteMetaData from "helpers/getVoteMetaData";
import {
  useActiveVotes,
  useCommittedVotes,
  useContentfulData,
  useDecryptedVotes,
  useEncryptedVotes,
  useRevealedVotes,
} from "hooks/queries";
import { createContext, ReactNode } from "react";
import {
  ContentfulDataByProposalNumberT,
  DecryptedVotesByKeyT,
  EncryptedVotesByKeyT,
  PriceRequestByKeyT,
  VoteExistsByKeyT,
  VoteT,
} from "types/global";

interface VotesContextState {
  activeVotes: PriceRequestByKeyT;
  committedVotes: VoteExistsByKeyT;
  revealedVotes: VoteExistsByKeyT;
  encryptedVotes: EncryptedVotesByKeyT;
  decryptedVotes: DecryptedVotesByKeyT;
  contentfulData: ContentfulDataByProposalNumberT;
  getActiveVotes: () => VoteT[];
}

export const defaultVotesContextState: VotesContextState = {
  activeVotes: {},
  committedVotes: {},
  revealedVotes: {},
  encryptedVotes: {},
  decryptedVotes: {},
  contentfulData: {},
  getActiveVotes: () => [],
};

export const VotesContext = createContext<VotesContextState>(defaultVotesContextState);

export function VotesProvider({ children }: { children: ReactNode }) {
  const { activeVotes } = useActiveVotes();
  const { contentfulData } = useContentfulData(Object.values(activeVotes));
  const { committedVotes } = useCommittedVotes();
  const { revealedVotes } = useRevealedVotes();
  const { encryptedVotes } = useEncryptedVotes();
  const decryptedVotes = useDecryptedVotes(encryptedVotes);

  function getActiveVotes(): VoteT[] {
    return Object.entries(activeVotes).map(([uniqueKey, vote]) => {
      return {
        ...vote,
        uniqueKey,
        isCommitted: committedVotes[uniqueKey] ?? false,
        isRevealed: revealedVotes[uniqueKey] ?? false,
        encryptedVote: encryptedVotes[uniqueKey],
        decryptedVote: decryptedVotes[uniqueKey],
        contentfulData: contentfulData[uniqueKey],
        ...getVoteMetaData(
          vote.decodedIdentifier,
          vote.decodedAncillaryData,
          vote.transactionHash,
          contentfulData?.[uniqueKey]
        ),
      };
    });
  }

  return (
    <VotesContext.Provider
      value={{
        activeVotes,
        committedVotes,
        revealedVotes,
        encryptedVotes,
        decryptedVotes,
        contentfulData,
        getActiveVotes,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
