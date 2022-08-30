import getVoteMetaData from "helpers/getVoteMetaData";
import {
  useActiveVotes,
  useUmipDataFromContentful,
  useWithDecryptedVotes,
  useWithEncryptedVotes,
  useWithIsCommitted,
  useWithIsRevealed,
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
  const { umipDataFromContentful: contentfulData } = useUmipDataFromContentful(Object.values(activeVotes));
  const { withIsCommitted: votesCommittedByUser } = useWithIsCommitted();
  const { withIsRevealed: votesRevealedByUser } = useWithIsRevealed();
  const { withEncryptedVotes: encryptedVotesByUser } = useWithEncryptedVotes();
  const decryptedVotesByUser = useWithDecryptedVotes(encryptedVotesByUser);

  function getActiveVotes() {
    return Object.entries(activeVotes).map(([uniqueKey, vote]) => {
      return {
        ...vote,
        uniqueKey,
        isCommitted: votesCommittedByUser[uniqueKey],
        isRevealed: votesRevealedByUser[uniqueKey],
        encryptedVote: encryptedVotesByUser[uniqueKey],
        decryptedVote: decryptedVotesByUser?.[uniqueKey],
        umipDataFromContentful: contentfulData?.[uniqueKey],
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
        votesCommittedByUser,
        votesRevealedByUser,
        encryptedVotesByUser,
        decryptedVotesByUser,
        contentfulData,
        getActiveVotes,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
