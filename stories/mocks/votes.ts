import { sub } from "date-fns";
import { BigNumber } from "ethers";
import { bigNumberFromFloatString, maybeMakePolymarketOptions } from "helpers";
import { VoteT } from "types";

export const voteWithoutUserVote = {
  isCommitted: false,
  commitHash: undefined,
  title:
    "SuperUMAn DAO KPI Options funding proposal and a bunch of extra text that will presumably trigger an overflow",
  origin: "UMA" as const,
  description: "Some description",
  voteNumber: BigNumber.from(123),
  umipOrUppUrl:
    "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-1.md",
  umipOrUppNumber: "umip-1",
  umipOrUppLink: undefined,
  timeAsDate: sub(new Date(), { days: 1 }),
  time: sub(new Date(), { days: 1 }).getTime() / 1000,
  timeMilliseconds: sub(new Date(), { days: 1 }).getTime(),
  identifier: "0x1234567890",
  ancillaryData: "0x1234567890",
  decodedIdentifier: "SuperUMAn DAO KPI Options funding proposal",
  decodedAncillaryData: "Test test test",
  decodedAdminTransactions: undefined,
  augmentedData: undefined,
  uniqueKey: "0x1234567890",
  umipNumber: 20,
  encryptedVote: undefined,
  decryptedVote: undefined,
  contentfulData: undefined,
  options: [
    { label: "Yes", value: "0", secondaryLabel: "p0" },
    { label: "No", value: "1", secondaryLabel: "p1" },
  ],
  links: [
    {
      label: "UMIP link",
      href: "https://www.todo.com",
    },
    {
      label: "Dispute txid",
      href: "https://www.todo.com",
    },
    {
      label: "Optimistic Oracle UI",
      href: "https://www.todo.com",
    },
  ],
  discordLink: "https://www.todo.com",
  isGovernance: false,
  isRevealed: false,
  canReveal: true,
  revealHash: undefined,
  isV1: false,
  voteHistory: {
    uniqueKey: "0x1234567890",
    voted: false,
    correctness: false,
    staking: false,
    slashAmount: BigNumber.from(0),
  },
  rollCount: 0,
  revealedVoteByAddress: {},
};

export const userVote = {
  encryptedVote: "0x0",
  decryptedVote: {
    price:
      "12341234123412354123512351235125123512351235129254252512521356126161234623462362346272",
    salt: "0",
  },
};

export const voteWithUserVote = {
  ...voteWithoutUserVote,
  ...userVote,
};

export const voteCommitted = {
  ...voteWithUserVote,
  isCommitted: true,
  commitHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
  revealHash: undefined,
  revealedVoteByAddress: {},
};

export const voteCommittedButNotRevealed = { ...voteCommitted };

export const voteRevealed = {
  ...voteCommittedButNotRevealed,
  isRevealed: true,
  revealHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
  commitHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
};

export const voteWithCorrectVoteWithoutUserVote = {
  ...voteWithoutUserVote,
  correctVote: "0",
};

export const voteWithCorrectVoteWithUserVote = {
  ...voteWithUserVote,
  correctVote: "0",
};

export function makeVoteWithHistory(
  vote: VoteT,
  voted = false,
  correctness = false,
  staking = false,
  slashAmount = BigNumber.from(0)
) {
  return {
    ...vote,
    voteHistory: {
      uniqueKey: vote.uniqueKey,
      voted,
      correctness,
      staking,
      slashAmount,
    },
  };
}

const mockVoteHistory = {
  voted: false,
  correctness: false,
  staking: false,
  slashAmount: BigNumber.from(0),
};

export type VoteHistoryMockArgsT = {
  vote?: VoteT;
  voted?: boolean;
  correctness?: boolean;
  staking?: boolean;
  slashAmount?: BigNumber;
  length?: number;
};

function makeMockVoteHistory(args?: VoteHistoryMockArgsT) {
  return {
    ...mockVoteHistory,
    ...args,
    uniqueKey: `${Math.random()}`,
    voted: args?.voted ?? Math.random() > 0.5,
    correctness: args?.correctness ?? Math.random() > 0.5,
    staking: args?.staking ?? Math.random() > 0.5,
    slashAmount:
      args?.slashAmount ??
      bigNumberFromFloatString(
        `${Math.random() > 0.5 ? "-" : ""}${Math.random() * 100}`
      ),
  };
}

export function makeMockVotesWithHistory(args?: VoteHistoryMockArgsT) {
  const votes = Array.from({ length: args?.length ?? 100 }, (_, i) => ({
    ...(args?.vote ?? voteWithCorrectVoteWithUserVote),
    voteNumber: BigNumber.from(i + 100),
    uniqueKey: `${Math.random()}`,
    voteHistory: makeMockVoteHistory(args),
  }));

  return votes as VoteT[];
}

export const mockPolymarketAncillaryData = `q: title: Test Polymarket Request with Early Request Option 1234
description: This is a test for the type of Polymarket request that DOES have an option for early request.
res_data: p1: 0, p2: 1, p3: 0.5, p4: -57896044618658097711785492504343953926634992332820282019728.792003956564819968
Where p1 corresponds to Something, p2 to Another, p3 to unknown, and p4 to an early request`;

export const polymarketVote = {
  isCommitted: false,
  commitHash: undefined,
  title: "Test Polymarket Request with Early Request Option 1234",
  origin: "UMA" as const,
  description:
    "This is a test for the type of Polymarket request that DOES have an option for early request.",
  voteNumber: BigNumber.from(123),
  umipOrUppUrl:
    "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-1.md",
  umipOrUppNumber: "umip-1",
  umipOrUppLink: undefined,
  timeAsDate: sub(new Date(), { days: 1 }),
  time: sub(new Date(), { days: 1 }).getTime() / 1000,
  timeMilliseconds: sub(new Date(), { days: 1 }).getTime(),
  identifier: "0x5945535f4f525f4e4f5f5155455259",
  ancillaryData:
    "0x713a207469746c653a205465737420506f6c796d61726b657420526571756573742077697468204561726c792052657175657374204f7074696f6e20313233340a6465736372697074696f6e3a20546869732069732061207465737420666f72207468652074797065206f6620506f6c796d61726b65742072657175657374207468617420444f4553206861766520616e206f7074696f6e20666f72206561726c7920726571756573742e0a7265735f646174613a2070313a20302c2070323a20312c2070333a20302e352c2070343a202d35373839363034343631383635383039373731313738353439323530343334333935333932363633343939323333323832303238323031393732382e3739323030333935363536343831393936380a576865726520703120636f72726573706f6e647320746f20536f6d657468696e672c20703220746f20416e6f746865722c20703320746f20756e6b6e6f776e2c20616e6420703420746f20616e206561726c7920726571756573",
  decodedIdentifier: "YES_OR_NO_QUERY",
  decodedAncillaryData: mockPolymarketAncillaryData,
  decodedAdminTransactions: undefined,
  augmentedData: undefined,
  uniqueKey: "0x1234567890",
  umipNumber: 20,
  encryptedVote: undefined,
  decryptedVote: undefined,
  contentfulData: undefined,
  options: maybeMakePolymarketOptions(mockPolymarketAncillaryData),
  links: [
    {
      label: "UMIP link",
      href: "https://www.todo.com",
    },
    {
      label: "Dispute txid",
      href: "https://www.todo.com",
    },
    {
      label: "Optimistic Oracle UI",
      href: "https://www.todo.com",
    },
  ],
  discordLink: "https://www.todo.com",
  isGovernance: false,
  isRevealed: false,
  canReveal: true,
  revealHash: undefined,
  isV1: false,
  voteHistory: {
    uniqueKey: "0x1234567890",
    voted: false,
    correctness: false,
    staking: false,
    slashAmount: BigNumber.from(0),
  },
  rollCount: 0,
  revealedVoteByAddress: {},
};

export const polymarketVoteCommitted = {
  ...polymarketVote,
  encryptedVote: "0x0",
  decryptedVote: {
    price: "0",
    salt: "0",
  },
  isCommitted: true,
  commitHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
  revealHash: undefined,
  revealedVoteByAddress: {},
};
