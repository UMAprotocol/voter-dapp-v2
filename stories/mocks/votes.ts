import { sub } from "date-fns";
import { BigNumber } from "ethers";
import { bigNumberFromFloatString } from "helpers";
import { VoteT } from "types";

export const voteWithoutUserVote = {
  isCommitted: false,
  commitHash: undefined,
  isRolled: false,
  title:
    "SuperUMAn DAO KPI Options funding proposal and a bunch of extra text that will presumably trigger an overflow",
  origin: "UMA" as const,
  description: "Some description",
  transactionHash: "0x1234567890",
  voteNumber: BigNumber.from(123),
  umipOrUppUrl:
    "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-1.md",
  umipOrUppNumber: "umip-1",
  timeAsDate: sub(new Date(), { days: 1 }),
  time: sub(new Date(), { days: 1 }).getTime() / 1000,
  timeMilliseconds: sub(new Date(), { days: 1 }).getTime(),
  identifier: "0x1234567890",
  ancillaryData: "0x1234567890",
  decodedIdentifier: "SuperUMAn DAO KPI Options funding proposal",
  decodedAncillaryData: "Test test test",
  decodedAdminTransactions: undefined,
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
  revealHash: undefined,
  isV1: false,
  voteHistory: {
    uniqueKey: "0x1234567890",
    voted: false,
    correctness: false,
    staking: false,
    slashAmount: BigNumber.from(0),
  },
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
  correctVote: 0,
};

export const voteWithCorrectVoteWithUserVote = {
  ...voteWithUserVote,
  correctVote: 0,
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
