import getVoteMetaData from "helpers/getVoteMetaData";
import {
  useAccountDetails,
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
  getIsLoading: () => boolean;
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
  getIsLoading: () => true,
};

export const VotesContext = createContext<VotesContextState>(defaultVotesContextState);

export function VotesProvider({ children }: { children: ReactNode }) {
  const { data: hasActiveVotes, isLoading: hasActiveVotesIsLoading } = useHasActiveVotes();
  const { data: activeVotes, isLoading: activeVotesIsLoading } = useActiveVotes();
  const {
    data: { upcomingVotes, hasUpcomingVotes },
    isLoading: upcomingVotesIsLoading,
  } = useUpcomingVotes();
  const { data: pastVotes, isLoading: pastVotesIsLoading } = usePastVotes();
  const { data: contentfulData, isLoading: contentfulDataIsLoading } = useContentfulData();
  const { data: committedVotes, isLoading: committedVotesIsLoading } = useCommittedVotes();
  const { data: revealedVotes, isLoading: revealedVotesIsLoading } = useRevealedVotes();
  const { data: encryptedVotes, isLoading: encryptedVotesIsLoading } = useEncryptedVotes();
  const { data: decryptedVotes, isLoading: decryptedVotesIsLoading } = useDecryptedVotes();
  const { address } = useAccountDetails();

  function getIsLoading() {
    const isLoadingUserDependent =
      contentfulDataIsLoading ||
      committedVotesIsLoading ||
      revealedVotesIsLoading ||
      encryptedVotesIsLoading ||
      decryptedVotesIsLoading;

    const isLoadingUserIndependent =
      hasActiveVotesIsLoading || activeVotesIsLoading || upcomingVotesIsLoading || pastVotesIsLoading;

    if (address) return isLoadingUserDependent || isLoadingUserIndependent;

    return isLoadingUserIndependent;
  }

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
        getIsLoading,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
