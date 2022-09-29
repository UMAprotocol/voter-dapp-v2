import { sub } from "date-fns";
import { BigNumber } from "ethers";

export const voteWithoutUserVote = {
  isCommitted: false,
  isRolled: false,
  title: "SuperUMAn DAO KPI Options funding proposal",
  origin: "UMA" as const,
  description: "Some description",
  transactionHash: "0x1234567890",
  voteNumber: BigNumber.from(123),
  umipUrl: "https://uma.io",
  timeAsDate: sub(new Date(), { days: 1 }),
  time: sub(new Date(), { days: 1 }).getTime() / 1000,
  timeMilliseconds: sub(new Date(), { days: 1 }).getTime(),
  identifier: "0x1234567890",
  ancillaryData: "0x1234567890",
  decodedIdentifier: "SuperUMAn DAO KPI Options funding proposal",
  decodedAncillaryData: "Test test test",
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
};

export const userVote = {
  encryptedVote: "0x0",
  decryptedVote: {
    price: "0",
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
};

export const voteCommittedButNotRevealed = { ...voteCommitted };

export const voteRevealed = { ...voteCommittedButNotRevealed, isRevealed: true };

export const voteWithCorrectVoteWithoutUserVote = {
  ...voteWithoutUserVote,
  correctVote: 0,
};

export const voteWithCorrectVoteWithUserVote = {
  ...voteWithUserVote,
  correctVote: 0,
};
