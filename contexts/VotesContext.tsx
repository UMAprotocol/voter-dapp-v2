import { BigNumber } from "ethers";
import { getVoteMetaData } from "helpers";
import {
  useAccountDetails,
  useActiveVoteResults,
  useActiveVotes,
  useCommittedVotes,
  useCommittedVotesByCaller,
  useCommittedVotesForDelegator,
  useContentfulData,
  useDecodedAdminTransactions,
  useDecryptedVotes,
  useDelegationContext,
  useDesignatedVotingV1Address,
  useEncryptedVotes,
  usePastVotes,
  useRevealedVotes,
  useUpcomingVotes,
  useUserVotingAndStakingDetails,
  useVoteTimingContext,
} from "hooks";
import { ReactNode, createContext, useMemo } from "react";
import {
  ActivityStatusT,
  ContentfulDataByKeyT,
  DecryptedVotesByKeyT,
  EncryptedVotesByKeyT,
  PriceRequestByKeyT,
  PriceRequestT,
  UniqueKeyT,
  VoteExistsByKeyT,
  VoteParticipationT,
  VoteResultsT,
  VoteT,
} from "types";

export interface VotesContextState {
  voteListsByActivityStatus: Record<ActivityStatusT, VoteT[] | undefined>;
  hasPreviouslyCommittedAll: boolean | undefined;
  votesToReveal: VoteT[] | undefined;
  activityStatus: ActivityStatusT | undefined;
  isActive: boolean | undefined;
  isUpcoming: boolean | undefined;
  isPast: boolean | undefined;
  activeVotesByKey: PriceRequestByKeyT | undefined;
  activeVoteList: VoteT[];
  upcomingVotesByKey: PriceRequestByKeyT | undefined;
  upcomingVoteList: VoteT[];
  pastVotesByKey: PriceRequestByKeyT | undefined;
  pastVoteList: VoteT[];
  pastVotesV2List: VoteT[];
  committedVotes: VoteExistsByKeyT | undefined;
  revealedVotes: VoteExistsByKeyT | undefined;
  encryptedVotes: EncryptedVotesByKeyT | undefined;
  decryptedVotes: DecryptedVotesByKeyT | undefined;
  contentfulData: ContentfulDataByKeyT | undefined;
  activeVotesIsLoading: boolean;
  upcomingVotesIsLoading: boolean;
  pastVotesIsLoading: boolean;
  contentfulDataIsLoading: boolean;
  committedVotesIsLoading: boolean;
  committedVotesByCallerIsLoading: boolean;
  committedVotesForDelegatorIsLoading: boolean;
  revealedVotesIsLoading: boolean;
  encryptedVotesIsLoading: boolean;
  decryptedVotesIsLoading: boolean;
}

export const defaultVotesContextState: VotesContextState = {
  voteListsByActivityStatus: {
    active: undefined,
    upcoming: undefined,
    past: undefined,
  },
  hasPreviouslyCommittedAll: undefined,
  votesToReveal: undefined,
  activityStatus: undefined,
  isActive: undefined,
  isUpcoming: undefined,
  isPast: undefined,
  activeVotesByKey: undefined,
  activeVoteList: [],
  upcomingVotesByKey: undefined,
  upcomingVoteList: [],
  pastVotesByKey: undefined,
  pastVoteList: [],
  pastVotesV2List: [],
  committedVotes: undefined,
  revealedVotes: undefined,
  encryptedVotes: undefined,
  decryptedVotes: undefined,
  contentfulData: undefined,
  activeVotesIsLoading: false,
  upcomingVotesIsLoading: false,
  pastVotesIsLoading: false,
  contentfulDataIsLoading: false,
  committedVotesIsLoading: false,
  committedVotesByCallerIsLoading: false,
  committedVotesForDelegatorIsLoading: false,
  revealedVotesIsLoading: false,
  encryptedVotesIsLoading: false,
  decryptedVotesIsLoading: false,
};

export const VotesContext = createContext<VotesContextState>(
  defaultVotesContextState
);

export function VotesProvider({ children }: { children: ReactNode }) {
  const { roundId } = useVoteTimingContext();
  const { address: userAddress } = useAccountDetails();
  const { isDelegate, delegatorAddress } = useDelegationContext();
  const userOrDelegatorAddress = isDelegate ? delegatorAddress : userAddress;
  const { data: designatedVotingV1Address } =
    useDesignatedVotingV1Address(userAddress);
  const { data: activeVotesByKey, isLoading: activeVotesIsLoading } =
    useActiveVotes();
  const { data: upcomingVotesByKey, isLoading: upcomingVotesIsLoading } =
    useUpcomingVotes();
  const { data: pastVotesByKey, isLoading: pastVotesIsLoading } =
    usePastVotes();
  const { data: contentfulData, isLoading: contentfulDataIsLoading } =
    useContentfulData();
  const { data: committedVotes, isLoading: committedVotesIsLoading } =
    useCommittedVotes(userAddress);
  const {
    data: committedVotesByCaller,
    isLoading: committedVotesByCallerIsLoading,
  } = useCommittedVotesByCaller(userAddress);
  const {
    data: committedVotesForDelegator,
    isLoading: committedVotesForDelegatorIsLoading,
  } = useCommittedVotesForDelegator();
  const {
    data: revealedVotes,
    isLoading: revealedVotesIsLoading,
    // if we are a delegate we need to override to our delegators address
  } = useRevealedVotes(userOrDelegatorAddress);
  const { data: encryptedVotes, isLoading: encryptedVotesIsLoading } =
    useEncryptedVotes(userAddress, roundId);
  const { data: decryptedVotes, isLoading: decryptedVotesIsLoading } =
    useDecryptedVotes(userAddress, encryptedVotes);
  const { data: activeVoteResultsByKey } = useActiveVoteResults();
  const { data: votingAndStakingDetails } = useUserVotingAndStakingDetails(
    userOrDelegatorAddress
  );
  const { data: decodedAdminTransactions } = useDecodedAdminTransactions();
  const { voteHistoryByKey } = votingAndStakingDetails || {};

  // This function tells you if your current logged in account can reveal this vote, ie the commit was cast by your current account.
  // This is important in the case where a delegate or delegator could have committed, this will determine if the account can reveal.
  function getCanReveal(uniqueKey: string): boolean {
    // This uses subtle logic to know if the current account was the committer.
    // for a regular wallet, they will always be both the voter and the caller but never the delegator.
    // for a delegator who committed, they will always be both voter and caller but not delegator, same as regular wallet.
    // for a delegate who committed, they will never be the voter, but will be the caller and have a vote by the delegator
    return (
      // this table finds all votes as the voter for the current account
      (!!committedVotes?.[uniqueKey] &&
        // this table finds all votes as the caller for the current account
        !!committedVotesByCaller?.[uniqueKey] &&
        // this table will look up your delagate if you are a delegator and find votes with them as the voter
        !committedVotesForDelegator?.[uniqueKey]) ||
      (!committedVotes?.[uniqueKey] &&
        !!committedVotesByCaller?.[uniqueKey] &&
        !!committedVotesForDelegator?.[uniqueKey])
    );
  }

  function getIsCommitted(uniqueKey: UniqueKeyT) {
    if (committedVotes === undefined || committedVotesByCaller === undefined) {
      return;
    }
    return !!committedVotes[uniqueKey] || !!committedVotesByCaller[uniqueKey];
  }

  function getIsRevealed(uniqueKey: UniqueKeyT) {
    if (revealedVotes === undefined) return;
    return !!revealedVotes[uniqueKey];
  }

  function getVotesWithData(
    priceRequests:
      | Record<UniqueKeyT, PriceRequestT & VoteParticipationT & VoteResultsT>
      | undefined,
    decryptedVotes: DecryptedVotesByKeyT | undefined
  ): VoteT[] {
    if (!priceRequests) return [];
    return Object.entries(priceRequests).map(([uniqueKey, vote]) => {
      // this value only exists when we have votes that have revealed from the graph, using this we can
      // lookup revealed votes without a signature, just have to find the right address
      const pastVoteRevealed: string | undefined =
        vote?.revealedVoteByAddress[userAddress ?? ""] ||
        (designatedVotingV1Address &&
          vote.revealedVoteByAddress[designatedVotingV1Address]) ||
        (userOrDelegatorAddress &&
          vote.revealedVoteByAddress[userOrDelegatorAddress]);

      // This resolves the graph's limitation of not reflecting the voter's latest participation until they commit to 
      // the next vote.
      if (voteHistoryByKey && voteHistoryByKey[uniqueKey] !== undefined) {
        voteHistoryByKey[uniqueKey].correctness = vote.correctVote
          ? pastVoteRevealed === vote.correctVote
          : false;
      }

      return {
        ...vote,
        // prefer active vote results first, this will either exist or not, if not we can just fall back to the default vote results
        results: activeVoteResultsByKey?.[uniqueKey]?.results ?? vote?.results,
        participation:
          activeVoteResultsByKey?.[uniqueKey]?.participation ??
          vote?.participation,
        uniqueKey,
        isCommitted: getIsCommitted(uniqueKey),
        commitHash:
          committedVotes?.[uniqueKey] ||
          committedVotesForDelegator?.[uniqueKey],
        isRevealed: getIsRevealed(uniqueKey),
        // tells you if you can possibily reveal this vote, it does not check all conditions (ie in reveal phase, etc)
        canReveal: getCanReveal(uniqueKey),
        revealHash: revealedVotes?.[uniqueKey],
        encryptedVote: encryptedVotes?.[uniqueKey],
        decryptedVote: pastVoteRevealed
          ? { price: pastVoteRevealed, salt: "" }
          : decryptedVotes?.[uniqueKey],
        contentfulData: contentfulData?.[uniqueKey],
        voteHistory: voteHistoryByKey?.[uniqueKey] ?? {
          uniqueKey,
          voted: false,
          correctness: false,
          staking: false,
          slashAmount: BigNumber.from(0),
        },
        decodedAdminTransactions:
          decodedAdminTransactions?.[vote.decodedIdentifier],
        ...getVoteMetaData(
          vote.decodedIdentifier,
          vote.decodedAncillaryData,
          contentfulData?.[uniqueKey]
        ),
      };
    });
  }

  const activeVoteList = getVotesWithData(activeVotesByKey, decryptedVotes);
  const upcomingVoteList = getVotesWithData(upcomingVotesByKey, decryptedVotes);
  const pastVoteList = getVotesWithData(pastVotesByKey, decryptedVotes);
  const hasActiveVotes = activeVoteList.length > 0;
  const hasUpcomingVotes = upcomingVoteList.length > 0;
  const pastVotesV2List = pastVoteList.filter((vote) => !vote.isV1);

  const activityStatus: ActivityStatusT = hasActiveVotes
    ? "active"
    : hasUpcomingVotes
      ? "upcoming"
      : "past";
  const isActive = activityStatus === "active";
  const isUpcoming = activityStatus === "upcoming";
  const isPast = activityStatus === "past";
  const votesToReveal = activeVoteList.filter(
    ({ isCommitted, decryptedVote, isRevealed, canReveal }) =>
      isCommitted && !!decryptedVote && isRevealed === false && canReveal
  );
  const voteListsByActivityStatus = useMemo(
    () => ({
      active: activeVoteList,
      upcoming: upcomingVoteList,
      past: pastVoteList,
    }),
    [activeVoteList, pastVoteList, upcomingVoteList]
  );
  const hasPreviouslyCommittedAll =
    activeVoteList.filter(({ decryptedVote }) => decryptedVote).length ===
    activeVoteList.length;

  const value = useMemo(
    () => ({
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
      activeVotesIsLoading,
      upcomingVotesIsLoading,
      pastVotesIsLoading,
      contentfulDataIsLoading,
      committedVotesIsLoading,
      committedVotesByCallerIsLoading,
      committedVotesForDelegatorIsLoading,
      revealedVotesIsLoading,
      encryptedVotesIsLoading,
      decryptedVotesIsLoading,
    }),
    [
      activeVoteList,
      activeVotesByKey,
      activeVotesIsLoading,
      activityStatus,
      committedVotes,
      committedVotesByCallerIsLoading,
      committedVotesForDelegatorIsLoading,
      committedVotesIsLoading,
      contentfulData,
      contentfulDataIsLoading,
      decryptedVotes,
      decryptedVotesIsLoading,
      encryptedVotes,
      encryptedVotesIsLoading,
      hasActiveVotes,
      hasPreviouslyCommittedAll,
      hasUpcomingVotes,
      isActive,
      isPast,
      isUpcoming,
      pastVoteList,
      pastVotesByKey,
      pastVotesIsLoading,
      pastVotesV2List,
      revealedVotes,
      revealedVotesIsLoading,
      upcomingVoteList,
      upcomingVotesByKey,
      upcomingVotesIsLoading,
      voteListsByActivityStatus,
      votesToReveal,
    ]
  );

  return (
    <VotesContext.Provider value={value}>{children}</VotesContext.Provider>
  );
}
