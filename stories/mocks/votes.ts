import { sub } from "date-fns";
import { BigNumber } from "ethers";
import {
  bigNumberFromFloatString,
  formatBytes32String,
  makeUniqueKeyForVote,
  maybeMakePolymarketOptions,
} from "helpers";
import { VoteT } from "types";
import { date } from "./misc";

export const defaultMockVote = (number = 1): VoteT => {
  const decodedIdentifier = "MOCK_IDENTIFIER";
  const decodedAncillaryData = `MOCK_ANCILLARY_DATA_${number}`;
  const identifier = formatBytes32String(decodedIdentifier);
  const ancillaryData = formatBytes32String(decodedAncillaryData);
  const timeAsDate = sub(date, { days: 1 });
  const timeMilliseconds = timeAsDate.getTime();
  const time = Math.round(timeAsDate.getTime() / 1000);
  const uniqueKey = makeUniqueKeyForVote(
    decodedIdentifier,
    time,
    ancillaryData
  );
  const options = maybeMakePolymarketOptions(decodedAncillaryData);
  return {
    isCommitted: false,
    commitHash: undefined,
    title: `Default mock vote #${number}`,
    origin: "UMA" as const,
    description: "Some description",
    umipOrUppNumber: "umip-1",
    umipOrUppLink: undefined,
    timeAsDate,
    time,
    timeMilliseconds,
    identifier,
    ancillaryData,
    decodedIdentifier,
    decodedAncillaryData,
    decodedAdminTransactions: undefined,
    uniqueKey,
    encryptedVote: undefined,
    decryptedVote: undefined,
    contentfulData: undefined,
    options,
    discordLink: "https://www.todo.com",
    isGovernance: false,
    isRevealed: false,
    canReveal: true,
    revealHash: undefined,
    isV1: false,
    voteHistory: {
      uniqueKey,
      voted: false,
      correctness: false,
      staking: false,
      slashAmount: BigNumber.from(0),
    },
    rollCount: 0,
    revealedVoteByAddress: {},
    isAssertion: false,
  };
};

export function makeMockVotes(
  args: {
    count?: number;
    inputs?: Partial<VoteT>[];
    inputForAll?: Partial<VoteT>;
  } = {}
) {
  const { count, inputs = [], inputForAll } = args;

  const length = count || inputs.length;

  const votes = Array.from({ length }, (_, i) => {
    const input = inputs[i] || {};
    const vote = defaultMockVote(i);
    return { ...vote, ...input };
  });

  if (inputForAll) {
    votes.forEach((vote) => {
      Object.assign(vote, inputForAll);
    });
  }

  return votes;
}

export const mockEncryptedAndDecrypted = {
  encryptedVote: "0x0",
  decryptedVote: {
    price: "1000000000000000000",
    salt: "0",
  },
};

export const mockCommitted = {
  ...mockEncryptedAndDecrypted,
  isCommitted: true,
  commitHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
  revealHash: undefined,
  revealedVoteByAddress: {},
};

export const mockRevealed = {
  isRevealed: true,
  revealHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
  commitHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
};

export const mockCorrectVote = {
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
    uniqueKey: `${JSON.stringify(args)}`,
    voted: args?.voted ?? true,
    correctness: args?.correctness ?? true,
    staking: args?.staking ?? true,
    slashAmount: args?.slashAmount ?? bigNumberFromFloatString("100"),
  };
}

export function makeMockVotesWithHistory(args?: VoteHistoryMockArgsT) {
  return makeMockVotes({ inputForAll: makeMockVoteHistory(args) });
}

export const mockPolymarketAncillaryData = `q: title: Test Polymarket Request with Early Request Option 1234 This is a test for the type of Polymarket request that DOES have an option for early request.
description: This is a test for the type of Polymarket request that DOES have an option for early request.
res_data: p1: 0, p2: 1, p3: 0.5, p4: -57896044618658097711785492504343953926634992332820282019728.792003956564819968
Where p1 corresponds to Something, p2 to Another, p3 to unknown, and p4 to an early request`;

export const polymarketVote = {
  title:
    "Test Polymarket Request with Early Request Option 1234 This is a test for the type of Polymarket request that DOES have an option for early request.",
  origin: "Polymarket" as const,
  description:
    "This is a test for the type of Polymarket request that DOES have an option for early request.",
  identifier: "0x5945535f4f525f4e4f5f5155455259",
  ancillaryData:
    "0x713a207469746c653a205465737420506f6c796d61726b657420526571756573742077697468204561726c792052657175657374204f7074696f6e20313233340a6465736372697074696f6e3a20546869732069732061207465737420666f72207468652074797065206f6620506f6c796d61726b65742072657175657374207468617420444f4553206861766520616e206f7074696f6e20666f72206561726c7920726571756573742e0a7265735f646174613a2070313a20302c2070323a20312c2070333a20302e352c2070343a202d35373839363034343631383635383039373731313738353439323530343334333935333932363633343939323333323832303238323031393732382e3739323030333935363536343831393936380a576865726520703120636f72726573706f6e647320746f20536f6d657468696e672c20703220746f20416e6f746865722c20703320746f20756e6b6e6f776e2c20616e6420703420746f20616e206561726c7920726571756573",
  decodedIdentifier: "YES_OR_NO_QUERY",
  decodedAncillaryData: mockPolymarketAncillaryData,
  options: maybeMakePolymarketOptions(mockPolymarketAncillaryData),
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

export const polymarketVoteRevealed = {
  ...polymarketVoteCommitted,
  isRevealed: true,
  revealHash:
    "0xb7013512cb5f4e59fd08c299d8534373457f0f02aeb294e4f61611bfc8f43286",
};

export const polymarketVoteCommittedCustomInput = {
  ...polymarketVoteCommitted,
  decryptedVote: {
    price: "123000000000000000000",
    salt: "0",
  },
};

export const polymarketVoteRevealedCustomInput = {
  ...polymarketVoteRevealed,
  decryptedVote: {
    price: "123000000000000000000",
    salt: "0",
  },
};
