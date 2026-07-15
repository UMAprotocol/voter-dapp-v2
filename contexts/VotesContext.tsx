import { BigNumber } from "ethers";
import { getVoteMetaData } from "helpers";
import {
  useAccountDetails,
  useActiveVoteResults,
  useActiveVotes,
  useCommittedVotes,
  useCommittedVotesByCaller,
  useCommittedVotesForDelegator,
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
  DecodedAdminTransactionsByIdentifierT,
  DecryptedVotesByKeyT,
  EncryptedVotesByKeyT,
  PriceRequestByKeyT,
  PriceRequestT,
  UniqueKeyT,
  VoteExistsByKeyT,
  VoteHistoryByKeyT,
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
  activeVotesIsLoading: boolean;
  upcomingVotesIsLoading: boolean;
  pastVotesIsLoading: boolean;
  // false when a list query is disabled (wrong chain, graph off) — unlike
  // isLoading, which react-query v4 reports as true forever for a disabled
  // query with no data. Consumers waiting for lists to settle must use these.
  activeVotesIsInitialLoading: boolean;
  upcomingVotesIsInitialLoading: boolean;
  pastVotesIsInitialLoading: boolean;
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
  activeVotesIsLoading: false,
  upcomingVotesIsLoading: false,
  pastVotesIsLoading: false,
  activeVotesIsInitialLoading: false,
  upcomingVotesIsInitialLoading: false,
  pastVotesIsInitialLoading: false,
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

type VoteLookupsT = {
  userAddress: string | undefined;
  designatedVotingV1Address: string | undefined;
  userOrDelegatorAddress: string | undefined;
  committedVotes: VoteExistsByKeyT | undefined;
  committedVotesByCaller: VoteExistsByKeyT | undefined;
  committedVotesForDelegator: VoteExistsByKeyT | undefined;
  revealedVotes: VoteExistsByKeyT | undefined;
  encryptedVotes: EncryptedVotesByKeyT | undefined;
  decryptedVotes: DecryptedVotesByKeyT | undefined;
  voteHistoryByKey: VoteHistoryByKeyT | undefined;
  activeVoteResultsByKey:
    | Record<UniqueKeyT, PriceRequestT & VoteParticipationT & VoteResultsT>
    | undefined;
  decodedAdminTransactions: DecodedAdminTransactionsByIdentifierT | undefined;
};

// This function tells you if your current logged in account can reveal this vote, ie the commit was cast by your current account.
// This is important in the case where a delegate or delegator could have committed, this will determine if the account can reveal.
function getCanReveal(uniqueKey: UniqueKeyT, lookups: VoteLookupsT): boolean {
  const { committedVotes, committedVotesByCaller, committedVotesForDelegator } =
    lookups;
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

function getIsCommitted(uniqueKey: UniqueKeyT, lookups: VoteLookupsT) {
  const { committedVotes, committedVotesByCaller } = lookups;
  if (committedVotes === undefined || committedVotesByCaller === undefined) {
    return;
  }
  return !!committedVotes[uniqueKey] || !!committedVotesByCaller[uniqueKey];
}

function getIsRevealed(uniqueKey: UniqueKeyT, lookups: VoteLookupsT) {
  if (lookups.revealedVotes === undefined) return;
  return !!lookups.revealedVotes[uniqueKey];
}

function getVotesWithData(
  priceRequests:
    | Record<UniqueKeyT, PriceRequestT & VoteParticipationT & VoteResultsT>
    | undefined,
  lookups: VoteLookupsT
): VoteT[] {
  const {
    userAddress,
    designatedVotingV1Address,
    userOrDelegatorAddress,
    committedVotes,
    committedVotesForDelegator,
    revealedVotes,
    encryptedVotes,
    decryptedVotes,
    voteHistoryByKey,
    activeVoteResultsByKey,
    decodedAdminTransactions,
  } = lookups;
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

    // Get the vote history with updated correctness if we have the data
    const voteHistoryForThisVote = voteHistoryByKey?.[uniqueKey]
      ? {
          ...voteHistoryByKey[uniqueKey],
          // Only update correctness if we have both correctVote and pastVoteRevealed
          // Otherwise, keep the correctness from the graph (which is based on slashAmount)
          correctness:
            vote.correctVote && pastVoteRevealed
              ? pastVoteRevealed === vote.correctVote
              : voteHistoryByKey[uniqueKey].correctness,
          // Update voted status if we have a revealed vote
          voted: voteHistoryByKey[uniqueKey].voted || !!pastVoteRevealed,
        }
      : pastVoteRevealed
      ? {
          uniqueKey,
          voted: true,
          correctness:
            vote.correctVote && pastVoteRevealed
              ? pastVoteRevealed === vote.correctVote
              : false,
          staking: false,
          slashAmount: BigNumber.from(0),
        }
      : {
          uniqueKey,
          voted: false,
          correctness: false,
          staking: false,
          slashAmount: BigNumber.from(0),
        };

    return {
      ...vote,
      // prefer active vote results first, this will either exist or not, if not we can just fall back to the default vote results
      results: activeVoteResultsByKey?.[uniqueKey]?.results ?? vote?.results,
      participation:
        activeVoteResultsByKey?.[uniqueKey]?.participation ??
        vote?.participation,
      uniqueKey,
      isCommitted: getIsCommitted(uniqueKey, lookups),
      commitHash:
        committedVotes?.[uniqueKey] || committedVotesForDelegator?.[uniqueKey],
      isRevealed: getIsRevealed(uniqueKey, lookups),
      // tells you if you can possibily reveal this vote, it does not check all conditions (ie in reveal phase, etc)
      canReveal: getCanReveal(uniqueKey, lookups),
      revealHash: revealedVotes?.[uniqueKey],
      encryptedVote: encryptedVotes?.[uniqueKey],
      decryptedVote: pastVoteRevealed
        ? { price: pastVoteRevealed, salt: "" }
        : decryptedVotes?.[uniqueKey],
      // attached lazily by useVotesWithUmipData for on-screen votes
      contentfulData: undefined,
      voteHistory: voteHistoryForThisVote,
      decodedAdminTransactions:
        decodedAdminTransactions?.[vote.decodedIdentifier],
      ...getVoteMetaData(
        vote.decodedIdentifier,
        vote.decodedAncillaryData,
        undefined
      ),
    };
  });
}

export function VotesProvider({ children }: { children: ReactNode }) {
  const { roundId } = useVoteTimingContext();
  const { address: userAddress } = useAccountDetails();
  const { isDelegate, delegatorAddress } = useDelegationContext();
  const userOrDelegatorAddress = isDelegate ? delegatorAddress : userAddress;
  const { data: designatedVotingV1Address } =
    useDesignatedVotingV1Address(userAddress);
  const {
    data: activeVotesByKey,
    isLoading: activeVotesIsLoading,
    isInitialLoading: activeVotesIsInitialLoading,
  } = useActiveVotes();
  const {
    data: upcomingVotesByKey,
    isLoading: upcomingVotesIsLoading,
    isInitialLoading: upcomingVotesIsInitialLoading,
  } = useUpcomingVotes();
  const {
    data: pastVotesByKey,
    isLoading: pastVotesIsLoading,
    isInitialLoading: pastVotesIsInitialLoading,
  } = usePastVotes();
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

  // building the vote lists decodes and cross-references every vote (including
  // the full past history), so only recompute when the underlying data changes
  const {
    activeVoteList,
    upcomingVoteList,
    pastVoteList,
    pastVotesV2List,
    votesToReveal,
    hasPreviouslyCommittedAll,
    voteListsByActivityStatus,
  } = useMemo(() => {
    const lookups: VoteLookupsT = {
      userAddress,
      designatedVotingV1Address,
      userOrDelegatorAddress,
      committedVotes,
      committedVotesByCaller,
      committedVotesForDelegator,
      revealedVotes,
      encryptedVotes,
      decryptedVotes,
      voteHistoryByKey,
      activeVoteResultsByKey,
      decodedAdminTransactions,
    };
    const activeVoteList = getVotesWithData(activeVotesByKey, lookups);
    const upcomingVoteList = getVotesWithData(upcomingVotesByKey, lookups);
    const pastVoteList = getVotesWithData(pastVotesByKey, lookups);
    return {
      activeVoteList,
      upcomingVoteList,
      pastVoteList,
      pastVotesV2List: pastVoteList.filter((vote) => !vote.isV1),
      votesToReveal: activeVoteList.filter(
        ({ isCommitted, decryptedVote, isRevealed, canReveal }) =>
          isCommitted && !!decryptedVote && isRevealed === false && canReveal
      ),
      hasPreviouslyCommittedAll:
        activeVoteList.filter(({ decryptedVote }) => decryptedVote).length ===
        activeVoteList.length,
      voteListsByActivityStatus: {
        active: activeVoteList,
        upcoming: upcomingVoteList,
        past: pastVoteList,
      },
    };
  }, [
    userAddress,
    designatedVotingV1Address,
    userOrDelegatorAddress,
    committedVotes,
    committedVotesByCaller,
    committedVotesForDelegator,
    revealedVotes,
    encryptedVotes,
    decryptedVotes,
    voteHistoryByKey,
    activeVoteResultsByKey,
    decodedAdminTransactions,
    activeVotesByKey,
    upcomingVotesByKey,
    pastVotesByKey,
  ]);

  const hasActiveVotes = activeVoteList.length > 0;
  const hasUpcomingVotes = upcomingVoteList.length > 0;
  const activityStatus: ActivityStatusT = hasActiveVotes
    ? "active"
    : hasUpcomingVotes
    ? "upcoming"
    : "past";
  const isActive = activityStatus === "active";
  const isUpcoming = activityStatus === "upcoming";
  const isPast = activityStatus === "past";

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
      activeVotesIsLoading,
      upcomingVotesIsLoading,
      pastVotesIsLoading,
      activeVotesIsInitialLoading,
      upcomingVotesIsInitialLoading,
      pastVotesIsInitialLoading,
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
      activeVotesIsInitialLoading,
      upcomingVotesIsInitialLoading,
      pastVotesIsInitialLoading,
      activityStatus,
      committedVotes,
      committedVotesByCallerIsLoading,
      committedVotesForDelegatorIsLoading,
      committedVotesIsLoading,
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
