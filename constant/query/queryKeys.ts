// voting - not user dependent
export const hasActiveVotesKey = "hasActiveVotesKey";
export const activeVotesKey = "activeVotesKey";
export const upcomingVotesKey = "upcomingVotesKey";
export const pastVotesKey = "pastVotesKey";
export const voteTransactionHashesKey = "voteTransactionHashesKey";
// voting - user dependent
export const encryptedVotesKey = "encryptedVotesKey";
export const decryptedVotesKey = "decryptedVotesKey";
export const committedVotesKey = "committedVotesKey";
export const revealedVotesKey = "revealedVotesKey";
export const contentfulDataKey = "contentfulDataKey";
// balances
export const tokenAllowanceKey = "tokenAllowanceKey";
export const unstakedBalanceKey = "unstakedBalanceKey";
export const outstandingRewardsKey = "outstandingRewardsKey";
export const stakerDetailsKey = "stakerDetailsKey";
export const unstakeCoolDownKey = "unstakeCoolDownKey";
// user
export const userDataKey = "userDataKey";
// delegation
export const delegatorSetEventForDelegateKey = "delegatorSetEventForDelegateKey";
export const delegatorSetEventsForDelegatorKey = "delegatorSetEventsForDelegatorKey";
export const receivedRequestsToBeDelegateKey = "receivedRequestsToBeDelegateKey";
export const sentRequestsToBeDelegateKey = "sentRequestsToBeDelegateKey";
export const voterFromDelegateKey = "voterFromDelegateKey";
export const delegateToStakerKey = "delegateToStakerKey";
export const ignoredRequestToBeDelegateAddressesKey = "ignoredRequestToBeDelegateAddressesKey";
export const committedVotesForDelegatorKey = "committedVotesForDelegatorKey";

export const votingNotUserDependentQueryKeys = [
  hasActiveVotesKey,
  activeVotesKey,
  upcomingVotesKey,
  pastVotesKey,
  voteTransactionHashesKey,
];

export const votingUserDependentQueryKeys = [
  encryptedVotesKey,
  decryptedVotesKey,
  committedVotesKey,
  revealedVotesKey,
  contentfulDataKey,
];

export const votingQueryKeys = [...votingNotUserDependentQueryKeys, ...votingUserDependentQueryKeys];

export const balancesQueryKeys = [tokenAllowanceKey, unstakedBalanceKey, outstandingRewardsKey, stakerDetailsKey];