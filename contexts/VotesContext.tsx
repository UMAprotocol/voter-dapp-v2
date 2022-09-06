import getVoteMetaData from "helpers/getVoteMetaData";
import {
  useActiveVotes,
  useCommittedVotes,
  useContentfulData,
  useDecryptedVotes,
  useEncryptedVotes,
  useHasActiveVotes,
  useRevealedVotes,
  useUpcomingVotes,
} from "hooks/queries";
import { createContext, ReactNode } from "react";
import {
  ContentfulDataByKeyT,
  DecryptedVotesByKeyT,
  EncryptedVotesByKeyT,
  PriceRequestByKeyT,
  VoteExistsByKeyT,
  VoteT,
} from "types/global";

interface VotesContextState {
  hasActiveVotes: boolean | undefined;
  activeVotes: PriceRequestByKeyT;
  upcomingVotes: PriceRequestByKeyT;
  committedVotes: VoteExistsByKeyT;
  revealedVotes: VoteExistsByKeyT;
  encryptedVotes: EncryptedVotesByKeyT;
  decryptedVotes: DecryptedVotesByKeyT;
  contentfulData: ContentfulDataByKeyT;
  getActiveVotes: () => VoteT[];
  getUpcomingVotes: () => VoteT[];
}

export const defaultVotesContextState: VotesContextState = {
  hasActiveVotes: undefined,
  activeVotes: {},
  upcomingVotes: {},
  committedVotes: {},
  revealedVotes: {},
  encryptedVotes: {},
  decryptedVotes: {},
  contentfulData: {},
  getActiveVotes: () => [],
  getUpcomingVotes: () => [],
};

export const VotesContext = createContext<VotesContextState>(defaultVotesContextState);

export function VotesProvider({ children }: { children: ReactNode }) {
  const { hasActiveVotes } = useHasActiveVotes();
  const { activeVotes } = useActiveVotes();
  const { upcomingVotes } = useUpcomingVotes();
  const { contentfulData } = useContentfulData();
  const { committedVotes } = useCommittedVotes();
  const { revealedVotes } = useRevealedVotes();
  const { encryptedVotes } = useEncryptedVotes();
  const decryptedVotes = useDecryptedVotes();

  function getActiveVotes() {
    return getVotesWithData(activeVotes);
  }

  function getUpcomingVotes() {
    return getVotesWithData(upcomingVotes);
  }

  function getVotesWithData(priceRequests: PriceRequestByKeyT): VoteT[] {
    return Object.entries(priceRequests).map(([uniqueKey, vote]) => {
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
          contentfulData[uniqueKey]
        ),
      };
    });
  }

  return (
    <VotesContext.Provider
      value={{
        hasActiveVotes,
        activeVotes,
        upcomingVotes,
        committedVotes,
        revealedVotes,
        encryptedVotes,
        decryptedVotes,
        contentfulData,
        getActiveVotes,
        getUpcomingVotes,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
