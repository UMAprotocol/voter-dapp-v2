import { VotingV2Ethers } from "@uma/contracts-frontend";
import { supportedChains } from "constant";
import { BigNumber } from "ethers";
import * as ss from "superstruct";
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
  correctVote?: string;
  // computed values
  timeMilliseconds: number;
  timeAsDate: Date;
  decodedIdentifier: string;
  decodedAncillaryData: string;
  uniqueKey: UniqueKeyT;
  isV1: boolean;
  isGovernance?: boolean;
  rollCount: number;
  resolvedPriceRequestIndex?: string;
  revealedVoteByAddress: RevealedVotesByAddress;
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
  vote: string;
  tokensVotedWith: number;
}[];

export type VoteResultsT = {
  results?: ResultsT;
};

export type RevealedVotesByAddress = Record<string, string>;

export type RawPriceRequestDataT = {
  time: BigNumber | number;
  identifier: string;
  ancillaryData: string;
  lastVotingRound?: number;
  correctVote?: string;
  participation?: ParticipationT;
  results?: ResultsT;
  isV1?: boolean;
  rollCount?: number;
  isGovernance?: boolean;
  resolvedPriceRequestIndex?: string;
  revealedVoteByAddress?: RevealedVotesByAddress;
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
  isAssertion: boolean;
  assertionId?: string | undefined;
  assertionAsserter?: string | undefined;
  assertionChildChainId?: number | undefined;
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

export type VoteOriginT =
  | "UMA"
  | "UMA Governance"
  | "Polymarket"
  | "Across"
  | "OSnap";

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
  signingKey: SigningKey;
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

export type SupportedChainIds = keyof typeof supportedChains;

export type MainnetOrGoerli = 1 | 5;

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

export const AugmentedVoteDataResponseT = ss.object({
  uniqueKey: ss.string(),
  time: ss.number(),
  identifier: ss.string(),
  l1RequestTxHash: ss.optional(ss.string()),
  ooRequestUrl: ss.optional(ss.string()),
  originatingChainTxHash: ss.optional(ss.string()),
  originatingChainId: ss.optional(ss.number()),
  originatingOracleType: ss.optional(ss.string()),
});
export type AugmentedVoteDataResponseT = ss.Infer<
  typeof AugmentedVoteDataResponseT
>;

export type VoteAugmentedDataT = {
  augmentedData: AugmentedVoteDataT | undefined;
};

export type AugmentedVoteDataT = {
  l1RequestTxHash: string;
  uniqueKey: UniqueKeyT;
  ooRequestUrl: string | undefined;
  originatingChainTxHash: string | undefined;
  originatingChainId: SupportedChainIds | undefined;
  originatingOracleType: OracleTypeT | undefined;
};

export type AugmentedVoteDataByKeyT = Record<UniqueKeyT, AugmentedVoteDataT>;

export type TransactionHashT = string;

export type RawDiscordMessageT = {
  content: string;
  author: {
    username: string;
    id: string;
    avatar: string;
  };
  timestamp: string;
  thread: { id: string };
  attachments: {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    width?: number;
    height?: number;
    content_type: string;
  }[];
  embeds: {
    type: string;
    url: string;
    title: string;
    description: string;
  }[];
  mentions: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
  }[];
};

export type RawDiscordThreadT = RawDiscordMessageT[];

export const DiscordMessageT = ss.object({
  message: ss.string(),
  sender: ss.string(),
  senderPicture: ss.optional(ss.string()),
  time: ss.number(),
});
export type DiscordMessageT = ss.Infer<typeof DiscordMessageT>;

export const VoteDiscussionT = ss.object({
  identifier: ss.string(),
  time: ss.number(),
  thread: ss.array(DiscordMessageT),
});
export type VoteDiscussionT = ss.Infer<typeof VoteDiscussionT>;

export const L1Request = ss.object({
  time: ss.number(),
  identifier: ss.string(),
});
export type L1Request = ss.Infer<typeof L1Request>;

export type ActionStatus = {
  tooltip?: string;
  label: string;
  infoText?: { label: string; tooltip: string };
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
};
