import { BigNumber } from "ethers";
import { getVoteMetaData } from "helpers";
import {
  useAccountDetails,
  useActiveVotes,
  useCommittedVotes,
  useContentfulData,
  useDecodedAdminTransactions,
  useDecryptedVotes,
  useEncryptedVotes,
  useHasActiveVotes,
  usePastVotes,
  useRevealedVotes,
  useUpcomingVotes,
  useUserVotingAndStakingDetails,
  useVoteTransactionHashes,
} from "hooks";
import { createContext, ReactNode } from "react";
import {
  ActivityStatusT,
  ContentfulDataByKeyT,
  DecryptedVotesByKeyT,
  EncryptedVotesByKeyT,
  PriceRequestByKeyT,
  VoteExistsByKeyT,
  VoteT,
} from "types";

export interface VotesContextState {
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
  getUserDependentIsLoading: () => boolean;
  getUserIndependentIsLoading: () => boolean;
  getIsLoading: () => boolean;
  getUserDependentIsFetching: () => boolean;
  getUserIndependentIsFetching: () => boolean;
  getIsFetching: () => boolean;
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
  getUserDependentIsLoading: () => false,
  getUserIndependentIsLoading: () => false,
  getIsLoading: () => false,
  getUserDependentIsFetching: () => false,
  getUserIndependentIsFetching: () => false,
  getIsFetching: () => false,
};

export const VotesContext = createContext<VotesContextState>(
  defaultVotesContextState
);

export function VotesProvider({ children }: { children: ReactNode }) {
  const {
    data: hasActiveVotes,
    isLoading: hasActiveVotesIsLoading,
    isFetching: hasActiveVotesIsFetching,
  } = useHasActiveVotes();
  const {
    data: activeVotes,
    isLoading: activeVotesIsLoading,
    isFetching: activeVotesIsFetching,
  } = useActiveVotes();
  const {
    data: { upcomingVotes, hasUpcomingVotes },
    isLoading: upcomingVotesIsLoading,
    isFetching: upcomingVotesIsFetching,
  } = useUpcomingVotes();
  const {
    data: pastVotes,
    isLoading: pastVotesIsLoading,
    isFetching: pastVotesIsFetching,
  } = usePastVotes();
  const {
    data: transactionHashes,
    isLoading: transactionHashesIsLoading,
    isFetching: transactionHashesIsFetching,
  } = useVoteTransactionHashes();
  const {
    data: contentfulData,
    isLoading: contentfulDataIsLoading,
    isFetching: contentfulDataIsFetching,
  } = useContentfulData();
  const {
    data: committedVotes,
    isLoading: committedVotesIsLoading,
    isFetching: committedVotesIsFetching,
  } = useCommittedVotes();
  const {
    data: revealedVotes,
    isLoading: revealedVotesIsLoading,
    isFetching: revealedVotesIsFetching,
  } = useRevealedVotes();
  const {
    data: encryptedVotes,
    isLoading: encryptedVotesIsLoading,
    isFetching: encryptedVotesIsFetching,
  } = useEncryptedVotes();
  const {
    data: decryptedVotes,
    isLoading: decryptedVotesIsLoading,
    isFetching: decryptedVotesIsFetching,
  } = useDecryptedVotes();
  const { address } = useAccountDetails();
  const {
    data: { voteHistoryByKey },
  } = useUserVotingAndStakingDetails();
  const { data: decodedAdminTransactions } = useDecodedAdminTransactions();

  function getUserDependentIsLoading() {
    if (!address) return false;

    return (
      contentfulDataIsLoading ||
      committedVotesIsLoading ||
      revealedVotesIsLoading ||
      encryptedVotesIsLoading ||
      decryptedVotesIsLoading
    );
  }

  function getUserIndependentIsLoading() {
    return (
      hasActiveVotesIsLoading ||
      activeVotesIsLoading ||
      upcomingVotesIsLoading ||
      pastVotesIsLoading ||
      transactionHashesIsLoading
    );
  }

  function getIsLoading() {
    return getUserDependentIsLoading() || getUserIndependentIsLoading();
  }

  function getUserDependentIsFetching() {
    if (!address) return false;

    return (
      contentfulDataIsFetching ||
      committedVotesIsFetching ||
      revealedVotesIsFetching ||
      encryptedVotesIsFetching ||
      decryptedVotesIsFetching
    );
  }

  function getUserIndependentIsFetching() {
    return (
      hasActiveVotesIsFetching ||
      activeVotesIsFetching ||
      upcomingVotesIsFetching ||
      pastVotesIsFetching ||
      transactionHashesIsFetching
    );
  }

  function getIsFetching() {
    return getUserDependentIsFetching() || getUserIndependentIsFetching();
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
        isCommitted: committedVotes[uniqueKey] ? true : false,
        commitHash: committedVotes[uniqueKey],
        isRevealed: revealedVotes[uniqueKey] ? true : false,
        revealHash: revealedVotes[uniqueKey],
        encryptedVote: encryptedVotes[uniqueKey],
        decryptedVote: decryptedVotes[uniqueKey],
        contentfulData: contentfulData[uniqueKey],
        transactionHash: transactionHashes[uniqueKey],
        voteHistory: voteHistoryByKey[uniqueKey] ?? {
          uniqueKey,
          voted: false,
          correctness: false,
          staking: false,
          slashAmount: BigNumber.from(0),
        },
        decodedAdminTransactions:
          decodedAdminTransactions[vote.decodedIdentifier],
        ...getVoteMetaData(
          vote.decodedIdentifier,
          vote.decodedAncillaryData,
          transactionHashes[uniqueKey],
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
        getUserDependentIsLoading,
        getUserIndependentIsLoading,
        getIsLoading,
        getUserDependentIsFetching,
        getUserIndependentIsFetching,
        getIsFetching,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
