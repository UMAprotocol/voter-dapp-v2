import { BigNumber } from "ethers";
import { getVoteMetaData } from "helpers";
import {
  useAccountDetails,
  useActiveVotes,
  useAugmentedVoteData,
  useCommittedVotes,
  useCommittedVotesByCaller,
  useCommittedVotesForDelegator,
  useContentfulData,
  useDecodedAdminTransactions,
  useDecryptedVotes,
  useDesignatedVotingV1Address,
  useEncryptedVotes,
  usePastVotes,
  useRevealedVotes,
  useUpcomingVotes,
  useUserVotingAndStakingDetails,
  useVoteTimingContext,
  useActiveVoteResults,
} from "hooks";
import { ReactNode, createContext, useState } from "react";
import {
  ActivityStatusT,
  ContentfulDataByKeyT,
  DecryptedVotesByKeyT,
  EncryptedVotesByKeyT,
  PriceRequestByKeyT,
  VoteExistsByKeyT,
  VoteParticipationT,
  PriceRequestT,
  VoteResultsT,
  UniqueKeyT,
  VoteT,
} from "types";

export interface VotesContextState {
  voteListsByActivityStatus: Record<ActivityStatusT, VoteT[]>;
  hasPreviouslyCommittedAll: boolean;
  votesToReveal: VoteT[];
  activityStatus: ActivityStatusT;
  isActive: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  hasActiveVotes: boolean | undefined;
  activeVotesByKey: PriceRequestByKeyT;
  activeVoteList: VoteT[];
  hasUpcomingVotes: boolean | undefined;
  upcomingVotesByKey: PriceRequestByKeyT;
  upcomingVoteList: VoteT[];
  pastVotesByKey: PriceRequestByKeyT;
  pastVoteList: VoteT[];
  pastVotesV2List: VoteT[];
  committedVotes: VoteExistsByKeyT;
  revealedVotes: VoteExistsByKeyT;
  encryptedVotes: EncryptedVotesByKeyT;
  decryptedVotes: DecryptedVotesByKeyT | undefined;
  contentfulData: ContentfulDataByKeyT;
  getUserDependentIsLoading: () => boolean;
  getUserIndependentIsLoading: () => boolean;
  getIsLoading: () => boolean;
  getUserDependentIsFetching: () => boolean;
  getUserIndependentIsFetching: () => boolean;
  getIsFetching: () => boolean;
  setAddressOverride: (address?: string) => void;
}

export const defaultVotesContextState: VotesContextState = {
  voteListsByActivityStatus: {
    active: [],
    upcoming: [],
    past: [],
  },
  hasPreviouslyCommittedAll: false,
  votesToReveal: [],
  activityStatus: "past",
  isActive: false,
  isUpcoming: false,
  isPast: false,
  hasActiveVotes: undefined,
  activeVotesByKey: {},
  activeVoteList: [],
  hasUpcomingVotes: undefined,
  upcomingVotesByKey: {},
  upcomingVoteList: [],
  pastVotesByKey: {},
  pastVoteList: [],
  pastVotesV2List: [],
  committedVotes: {},
  revealedVotes: {},
  encryptedVotes: {},
  decryptedVotes: {},
  contentfulData: {},
  getUserDependentIsLoading: () => false,
  getUserIndependentIsLoading: () => false,
  getIsLoading: () => false,
  getUserDependentIsFetching: () => false,
  getUserIndependentIsFetching: () => false,
  getIsFetching: () => false,
  setAddressOverride: () => undefined,
};

export const VotesContext = createContext<VotesContextState>(
  defaultVotesContextState
);

export function VotesProvider({ children }: { children: ReactNode }) {
  // usually you can add this extra address as your delegator if you are a delegate.
  const [addressOverride, setAddressOverride] = useState<string | undefined>(
    undefined
  );
  const { address } = useAccountDetails();
  const { data: designatedVotingV1Address } =
    useDesignatedVotingV1Address(address);
  const { roundId } = useVoteTimingContext();
  const {
    data: { activeVotes: activeVotesByKey, hasActiveVotes },
    isLoading: activeVotesIsLoading,
    isFetching: activeVotesIsFetching,
  } = useActiveVotes();
  const {
    data: { upcomingVotes: upcomingVotesByKey, hasUpcomingVotes },
    isLoading: upcomingVotesIsLoading,
    isFetching: upcomingVotesIsFetching,
  } = useUpcomingVotes();
  const {
    data: pastVotesByKey,
    isLoading: pastVotesIsLoading,
    isFetching: pastVotesIsFetching,
  } = usePastVotes();
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
    data: committedVotesByCaller,
    isLoading: committedVotesByCallerIsLoading,
    isFetching: committedVotesByCallerIsFetching,
  } = useCommittedVotesByCaller();
  const {
    data: committedVotesForDelegator,
    isLoading: committedVotesForDelegatorIsLoading,
    isFetching: committedVotesByForDelegatorFetching,
  } = useCommittedVotesForDelegator();
  const {
    data: revealedVotes,
    isLoading: revealedVotesIsLoading,
    isFetching: revealedVotesIsFetching,
    // if we are a delegate we need to override to our delegators address
  } = useRevealedVotes(addressOverride);
  const {
    data: encryptedVotes,
    isLoading: encryptedVotesIsLoading,
    isFetching: encryptedVotesIsFetching,
  } = useEncryptedVotes();
  const {
    data: decryptedVotes,
    isLoading: decryptedVotesIsLoading,
    isFetching: decryptedVotesIsFetching,
  } = useDecryptedVotes(roundId);
  const { data: activeVoteResultsByKey } = useActiveVoteResults();
  const {
    data: { voteHistoryByKey },
  } = useUserVotingAndStakingDetails(addressOverride);
  const { data: decodedAdminTransactions } = useDecodedAdminTransactions();
  const { data: augmentedData } = useAugmentedVoteData();
  function getUserDependentIsLoading() {
    if (!address) return false;

    return (
      contentfulDataIsLoading ||
      committedVotesIsLoading ||
      committedVotesByCallerIsLoading ||
      committedVotesForDelegatorIsLoading ||
      revealedVotesIsLoading ||
      encryptedVotesIsLoading ||
      decryptedVotesIsLoading
    );
  }

  function getUserIndependentIsLoading() {
    return activeVotesIsLoading || upcomingVotesIsLoading || pastVotesIsLoading;
  }

  function getIsLoading() {
    return getUserDependentIsLoading() || getUserIndependentIsLoading();
  }

  function getUserDependentIsFetching() {
    if (!address) return false;

    return (
      contentfulDataIsFetching ||
      committedVotesIsFetching ||
      committedVotesByCallerIsFetching ||
      committedVotesByForDelegatorFetching ||
      revealedVotesIsFetching ||
      encryptedVotesIsFetching ||
      decryptedVotesIsFetching
    );
  }

  function getUserIndependentIsFetching() {
    return (
      activeVotesIsFetching || upcomingVotesIsFetching || pastVotesIsFetching
    );
  }

  function getIsFetching() {
    return getUserDependentIsFetching() || getUserIndependentIsFetching();
  }

  function getActivityStatus() {
    if (hasActiveVotes) return "active";
    if (hasUpcomingVotes) return "upcoming";
    return "past";
  }

  // This function tells you if your current logged in account can reveal this vote, ie the commit was cast by your current account.
  // This is important in the case where a delegate or delegator could have committed, this will determine if the account can reveal.
  function getCanReveal(uniqueKey: string): boolean {
    // This uses subtle logic to know if the current account was the committer.
    // for a regular wallet, they will always be both the voter and the caller but never the delegator.
    // for a delegator who committed, they will always be both voter and caller but not delegator, same as regular wallet.
    // for a delegate who committed, they will never be the voter, but will be the caller and have a vote by the delegator
    return (
      // this table finds all votes as the voter for the current account
      (!!committedVotes[uniqueKey] &&
        // this table finds all votes as the caller for the current account
        !!committedVotesByCaller[uniqueKey] &&
        // this table will look up your delagate if you are a delegator and find votes with them as the voter
        !committedVotesForDelegator[uniqueKey]) ||
      (!committedVotes[uniqueKey] &&
        !!committedVotesByCaller[uniqueKey] &&
        !!committedVotesForDelegator[uniqueKey])
    );
  }

  function getVotesWithData(
    priceRequests: Record<
      UniqueKeyT,
      PriceRequestT & VoteParticipationT & VoteResultsT
    >,
    decryptedVotes: DecryptedVotesByKeyT
  ): VoteT[] {
    return Object.entries(priceRequests).map(([uniqueKey, vote]) => {
      // this value only exists when we have votes that have revealed from the graph, using this we can
      // lookup revealed votes without a signature, just have to find the right address
      const pastVoteRevealed: string | undefined =
        vote?.revealedVoteByAddress[address] ||
        (designatedVotingV1Address &&
          vote.revealedVoteByAddress[designatedVotingV1Address]) ||
        (addressOverride && vote.revealedVoteByAddress[addressOverride]);
      return {
        ...vote,
        // prefer active vote results first, this will either exist or not, if not we can just fall back to the default vote results
        results: activeVoteResultsByKey?.[uniqueKey]?.results ?? vote?.results,
        participation:
          activeVoteResultsByKey?.[uniqueKey]?.participation ??
          vote?.participation,
        uniqueKey,
        isCommitted:
          committedVotes[uniqueKey] || committedVotesForDelegator[uniqueKey]
            ? true
            : false,
        commitHash:
          committedVotes[uniqueKey] || committedVotesForDelegator[uniqueKey],
        isRevealed: revealedVotes[uniqueKey] ? true : false,
        // tells you if you can possibily reveal this vote, it does not check all conditions (ie in reveal phase, etc)
        canReveal: getCanReveal(uniqueKey),
        revealHash: revealedVotes[uniqueKey],
        encryptedVote: encryptedVotes[uniqueKey],
        decryptedVote: pastVoteRevealed
          ? { price: pastVoteRevealed, salt: "" }
          : decryptedVotes[uniqueKey],
        contentfulData: contentfulData[uniqueKey],
        augmentedData: augmentedData[uniqueKey],
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
          contentfulData[uniqueKey]
        ),
      };
    });
  }

  const activeVoteList = getVotesWithData(activeVotesByKey, decryptedVotes);
  const upcomingVoteList = getVotesWithData(upcomingVotesByKey, decryptedVotes);
  const pastVoteList = getVotesWithData(pastVotesByKey, decryptedVotes);
  const pastVotesV2List = pastVoteList.filter((vote) => !vote.isV1);

  const activityStatus = getActivityStatus();
  const isActive = activityStatus === "active";
  const isUpcoming = activityStatus === "upcoming";
  const isPast = activityStatus === "past";
  const votesToReveal = activeVoteList.filter(
    ({ isCommitted, decryptedVote, isRevealed, canReveal }) =>
      isCommitted && !!decryptedVote && isRevealed === false && canReveal
  );
  const voteListsByActivityStatus = {
    active: activeVoteList,
    upcoming: upcomingVoteList,
    past: pastVoteList,
  };
  const hasPreviouslyCommittedAll =
    activeVoteList.filter(({ decryptedVote }) => decryptedVote).length ===
    activeVoteList.length;

  return (
    <VotesContext.Provider
      value={{
        hasPreviouslyCommittedAll,
        voteListsByActivityStatus,
        votesToReveal,
        activityStatus,
        isActive,
        isUpcoming,
        isPast,
        hasActiveVotes,
        activeVotesByKey,
        activeVoteList,
        hasUpcomingVotes,
        upcomingVotesByKey,
        upcomingVoteList,
        pastVotesByKey,
        pastVoteList,
        pastVotesV2List,
        committedVotes,
        revealedVotes,
        encryptedVotes,
        decryptedVotes,
        contentfulData,
        getUserDependentIsLoading,
        getUserIndependentIsLoading,
        getIsLoading,
        getUserDependentIsFetching,
        getUserIndependentIsFetching,
        getIsFetching,
        setAddressOverride,
      }}
    >
      {children}
    </VotesContext.Provider>
  );
}
