import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { DropdownItemT, LinkT, UserVoteDataT } from "types";

export type UniqueKeyT = string;

export type VoteT = PriceRequestT &
  VoteHistoryDataT &
  VoteTransactionDataT &
  UserVoteDataT &
  VoteMetaDataT &
  VoteContentfulDataT &
  VoteParticipationT &
  VoteResultsT;

export type PriceRequestT = {
  // raw values
  time: number;
  identifier: string;
  ancillaryData: string;
  voteNumber: BigNumber;
  correctVote?: number;
  // computed values
  timeMilliseconds: number;
  timeAsDate: Date;
  decodedIdentifier: string;
  decodedAncillaryData: string;
  uniqueKey: UniqueKeyT;
};

export type ParticipationT = {
  uniqueCommitAddresses: number;
  uniqueRevealAddresses: number;
  totalTokensVotedWith: number;
};

export type VoteParticipationT = {
  participation?: ParticipationT;
};

export type ResultsT = {
  vote: number;
  tokensVotedWith: number;
}[];

export type VoteResultsT = {
  results?: ResultsT;
};

export type RawPriceRequestDataT = {
  time: BigNumber | number;
  identifier: string;
  ancillaryData: string;
  priceRequestIndex: BigNumber;
  correctVote?: number;
  participation?: ParticipationT;
  results?: ResultsT;
};

export type VoteTransactionDataT = {
  transactionHash: string;
};

export type VoteHistoryDataT = {
  voteHistory: VoteHistoryT;
};

export type VoteHistoryT = {
  uniqueKey: UniqueKeyT;
  voted: boolean;
  correctness: boolean;
  staking: boolean;
  slashAmount: BigNumber;
};

export type VoteHistoryByKeyT = Record<UniqueKeyT, VoteHistoryT>;

export type PriceRequestByKeyT = Record<UniqueKeyT, PriceRequestT>;

export type VoteMetaDataT = {
  title: string;
  description: string;
  umipUrl: string | undefined;
  umipNumber: number | undefined;
  origin: VoteOriginT;
  isGovernance: boolean;
  discordLink: string;
  links: LinkT[];
  options: DropdownItemT[] | undefined;
  isRolled: boolean;
};

export type VoteContentfulDataT = {
  contentfulData: ContentfulDataT | undefined;
};

export type ContentfulDataT = {
  description: string;
  discourseLink?: string;
  status?: string;
  authors?: string;
  title: string;
  number: number;
  umipLink?: string;
};

export type ContentfulDataByKeyT = Record<
  UniqueKeyT,
  ContentfulDataT | undefined
>;

export type EncryptedVoteT = string;
export type EncryptedVotesByKeyT = Record<
  UniqueKeyT,
  EncryptedVoteT | undefined
>;

export type DecryptedVoteT = { price: string; salt: string };
export type DecryptedVotesByKeyT = Record<
  UniqueKeyT,
  DecryptedVoteT | undefined
>;

export type VoteExistsByKeyT = Record<UniqueKeyT, boolean | undefined>;

export type SelectedVotesByKeyT = Record<UniqueKeyT, string | undefined>;

export type VotePhaseT = "commit" | "reveal" | null;

export type VoteTimelineT = {
  phase: VotePhaseT;
  phaseEnds: Date;
};

export type VoteOriginT = "UMA" | "Polymarket";

export type SigningKey = {
  publicKey: string;
  privateKey: string;
  signedMessage: string;
};

export type SigningKeys = {
  [address: string]: SigningKey;
};

export type UmipLinkT = {
  number: string;
  url: string;
};

export type IdentifierDetailsT = {
  identifier: string;
  summary: string;
  umipLink: UmipLinkT;
};

export type FormatVotesToCommit = {
  votes: VoteT[];
  selectedVotes: SelectedVotesByKeyT;
  roundId: number;
  address: string;
  signingKeys: SigningKeys;
};

export type VoteFormattedToCommitT = VoteT & {
  encryptedVote: EncryptedVoteT;
  hash: string;
};

export type CommitVotes = {
  voting: VotingV2Ethers;
  formattedVotes: VoteFormattedToCommitT[];
};

export type RevealVotes = {
  voting: VotingV2Ethers;
  votesToReveal: VoteT[];
};

export type ActivityStatusT = "active" | "upcoming" | "past";
