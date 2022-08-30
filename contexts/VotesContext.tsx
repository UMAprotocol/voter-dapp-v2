import getVoteMetaData from "helpers/getVoteMetaData";
import {
  useActiveVotes,
  useCommittedVotes,
  useDecryptedVotes,
  useEncryptedVotes,
  useRevealedVotes,
  useContentfulData,
} from "hooks/queries";
import { createContext, ReactNode } from "react";
import {
  ActiveVotesByKeyT,
  ContentfulDataByProposalNumberT,
  UserDecryptedVotesByKeyT,
  UserEncryptedVotesByKeyT,
  VoteExistsByKeyT,
  VoteT,
} from "types/global";

interface VotesContextState {
  activeVotes: ActiveVotesByKeyT;
  votesCommittedByUser: VoteExistsByKeyT;
  votesRevealedByUser: VoteExistsByKeyT;
  encryptedVotesByUser: UserEncryptedVotesByKeyT;
  decryptedVotesByUser: UserDecryptedVotesByKeyT;
  contentfulData: ContentfulDataByProposalNumberT;
  getActiveVotes: () => VoteT[];
}

export const defaultVotesContextState: VotesContextState = {
  activeVotes: {},
  votesCommittedByUser: {},
  votesRevealedByUser: {},
  encryptedVotesByUser: {},
  decryptedVotesByUser: {},
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

  function getActiveVotes() {
    return Object.entries(activeVotes).map(([uniqueKey, vote]) => {
      return {
        ...vote,
        uniqueKey,
        isCommitted: committedVotes[uniqueKey],
        isRevealed: revealedVotes[uniqueKey],
        encryptedVote: encryptedVotes[uniqueKey],
        decryptedVote: decryptedVotes?.[uniqueKey],
        contentfulData: contentfulData?.[uniqueKey],
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
        votesCommittedByUser: committedVotes,
        votesRevealedByUser: revealedVotes,
        encryptedVotesByUser: encryptedVotes,
        decryptedVotesByUser: decryptedVotes,
        contentfulData,
        getActiveVotes,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
