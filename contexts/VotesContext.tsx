import getVoteMetaData from "helpers/getVoteMetaData";
import {
  useActiveVotes,
  useCommittedVotes,
  useContentfulData,
  useDecryptedVotes,
  useEncryptedVotes,
  useHasActiveVotes,
  usePastVotes,
  useRevealedVotes,
  useUpcomingVotes,
} from "hooks/queries";
import { createContext, ReactNode } from "react";
import {
  ActivityStatusT,
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
  hasUpcomingVotes: boolean | undefined;
  upcomingVotes: PriceRequestByKeyT;
  pastVotes: PriceRequestByKeyT;
  committedVotes: VoteExistsByKeyT;
  revealedVotes: VoteExistsByKeyT;
  encryptedVotes: EncryptedVotesByKeyT;
  decryptedVotes: DecryptedVotesByKeyT | undefined;
  contentfulData: ContentfulDataByKeyT;
  getActiveVotes: () => VoteT[];
  getUpcomingVotes: () => VoteT[];
  getPastVotes: () => VoteT[];
  getActivityStatus: () => ActivityStatusT;
}

export const defaultVotesContextState: VotesContextState = {
  hasActiveVotes: undefined,
  activeVotes: {},
  hasUpcomingVotes: undefined,
  upcomingVotes: {},
  pastVotes: {},
  committedVotes: {},
  revealedVotes: {},
  encryptedVotes: {},
  decryptedVotes: {},
  contentfulData: {},
  getActiveVotes: () => [],
  getUpcomingVotes: () => [],
  getPastVotes: () => [],
  getActivityStatus: () => "past",
};

export const VotesContext = createContext<VotesContextState>(defaultVotesContextState);

export function VotesProvider({ children }: { children: ReactNode }) {
  const { hasActiveVotes } = useHasActiveVotes();
  const { activeVotes } = useActiveVotes();
  const { upcomingVotes, hasUpcomingVotes } = useUpcomingVotes();
  const { pastVotes } = usePastVotes();
  const { contentfulData } = useContentfulData();
  const { committedVotes } = useCommittedVotes();
  const { revealedVotes } = useRevealedVotes();
  const { encryptedVotes } = useEncryptedVotes();
  const { decryptedVotes } = useDecryptedVotes();

  function getActiveVotes() {
    return getVotesWithData(activeVotes);
  }

  function getUpcomingVotes() {
    return getVotesWithData(upcomingVotes);
  }

  function getPastVotes() {
    return getVotesWithData(pastVotes);
  }

  function getActivityStatus() {
    if (hasActiveVotes) return "active";
    if (hasUpcomingVotes) return "upcoming";
    return "past";
  }

  function getVotesWithData(priceRequests: PriceRequestByKeyT): VoteT[] {
    return Object.entries(priceRequests).map(([uniqueKey, vote]) => {
      return {
        ...vote,
        uniqueKey,
        isCommitted: committedVotes[uniqueKey] ?? false,
        isRevealed: revealedVotes[uniqueKey] ?? false,
        encryptedVote: encryptedVotes[uniqueKey],
        decryptedVote: decryptedVotes?.[uniqueKey],
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
        hasUpcomingVotes,
        upcomingVotes,
        pastVotes,
        committedVotes,
        revealedVotes,
        encryptedVotes,
        decryptedVotes,
        contentfulData,
        getActiveVotes,
        getUpcomingVotes,
        getPastVotes,
        getActivityStatus,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
