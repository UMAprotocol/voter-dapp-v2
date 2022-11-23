import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { DropdownItemT, LinkT, UserVoteDataT } from "types";

export type UniqueKeyT = string;

export type VoteT = PriceRequestT &
  VoteHistoryDataT &
  UserVoteDataT &
  VoteMetaDataT &
  VoteContentfulDataT &
  VoteParticipationT &
  VoteResultsT &
  VoteDecodedAdminTransactionsT &
  VoteAugmentedDataT;

export type PriceRequestT = {
  // raw values
  time: number;
  identifier: string;
  ancillaryData: string;
  voteNumber: BigNumber | undefined;
  correctVote?: number;
  // computed values
  timeMilliseconds: number;
  timeAsDate: Date;
  decodedIdentifier: string;
  decodedAncillaryData: string;
  uniqueKey: UniqueKeyT;
  isV1: boolean;
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
  priceRequestIndex: BigNumber | undefined;
  correctVote?: number;
  participation?: ParticipationT;
  results?: ResultsT;
  isV1?: boolean;
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
  umipOrUppLink: LinkT | undefined;
  umipOrUppNumber: string | undefined;
  origin: VoteOriginT;
  isGovernance: boolean;
  discordLink: string;
  options: DropdownItemT[] | undefined;
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

export type VoteExistsByKeyT = Record<UniqueKeyT, string | undefined>;

export type SelectedVotesByKeyT = Record<UniqueKeyT, string | undefined>;

export type VotePhaseT = "commit" | "reveal" | null;

export type VoteTimelineT = {
  phase: VotePhaseT;
  phaseEnds: Date;
};

export type VoteOriginT = "UMA" | "Polymarket" | "Across";

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

export type DecodedAdminTransactionsT = {
  identifier: string;
  transactions: DecodedAdminTransactionDataT[];
};

export type DecodedAdminTransactionDataT = {
  data: string;
  decodedData: string;
  to: string;
  value: string;
};

export type DecodedAdminTransactionsByIdentifierT = Record<
  string,
  DecodedAdminTransactionsT
>;

export type VoteDecodedAdminTransactionsT = {
  decodedAdminTransactions: DecodedAdminTransactionsT | undefined;
};

export type SupportedChainIds = 1 | 5 | 10 | 137 | 42161;

export type NodeUrl = string;

export type NodeUrls = Record<SupportedChainIds, NodeUrl>;

export type IdentifierAndTimeStampT = {
  identifier: string;
  time: number;
};

export type OracleTypeT =
  | "OptimisticOracle"
  | "OptimisticOracleV2"
  | "SkinnyOptimisticOracle";

export type AugmentedVoteDataT = {
  l1RequestTxHash: string;
  uniqueKey: UniqueKeyT;
  ooRequestUrl: string | undefined;
  originatingChainId: SupportedChainIds | undefined;
  originatingOracleType: OracleTypeT | undefined;
};

export type VoteAugmentedDataT = {
  augmentedData: AugmentedVoteDataT | undefined;
};

export type AugmentedVoteDataByKeyT = Record<UniqueKeyT, AugmentedVoteDataT>;

export type TransactionHashT = string | "rolled";
