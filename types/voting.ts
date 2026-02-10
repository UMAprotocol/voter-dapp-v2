import { VotingV2Ethers } from "@uma/contracts-frontend";
import { supportedChains } from "constant";
import { BigNumber } from "ethers";
import { DropdownItemT, LinkT, UserVoteDataT } from "types";
import * as ss from "superstruct";
import { APIMessage } from "discord-api-types/v10";

export type UniqueKeyT = string;

export type VoteT = PriceRequestT &
  VoteHistoryDataT &
  UserVoteDataT &
  VoteMetaDataT &
  VoteContentfulDataT &
  VoteParticipationT &
  VoteResultsT &
  VoteDecodedAdminTransactionsT;

export type PriceRequestT = {
  // raw values
  time: number;
  identifier: string;
  ancillaryData: string;
  ancillaryDataL2: string;
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
  totalTokensCommitted?: number;
  minAgreementRequirement?: number;
  minParticipationRequirement?: number;
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
  ancillaryDataL2: string;
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
  | "Polymarket"
  | "Across"
  | "OSnap"
  | "Predict.Fun"
  | "Infinite Games"
  | "Probable";

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

export type MainnetOrL1Testnet = 1 | 5 | 11155111;

export type NodeUrl = string;

export type NodeUrls = Record<SupportedChainIds, NodeUrl>;

export type IdentifierAndTimeStampT = {
  identifier: string;
  time: number;
};

export type OracleTypeT =
  | "OptimisticOracle"
  | "OptimisticOracleV2"
  | "OptimisticOracleV3"
  | "SkinnyOptimisticOracle";

export const AugmentedVoteDataResponseSchema = ss.object({
  uniqueKey: ss.string(),
  time: ss.number(),
  identifier: ss.string(),
  l1RequestTxHash: ss.optional(ss.string()),
  ooRequestUrl: ss.optional(ss.string()),
  originatingChainTxHash: ss.optional(ss.string()),
  originatingChainId: ss.optional(ss.number()),
  originatingOracleType: ss.optional(ss.string()),
  proposedPrice: ss.optional(ss.string()),
  optimisticOracleV3Data: ss.optional(
    ss.object({
      assertionId: ss.optional(ss.string()),
      domainId: ss.optional(ss.string()),
      claim: ss.optional(ss.string()),
      asserter: ss.optional(ss.string()),
      callbackRecipient: ss.optional(ss.string()),
      escalationManager: ss.optional(ss.string()),
      expirationTime: ss.optional(ss.number()),
      caller: ss.optional(ss.string()),
    })
  ),
});
export type AugmentedVoteDataResponseT = ss.Infer<
  typeof AugmentedVoteDataResponseSchema
>;

export type VoteAugmentedDataT = {
  augmentedData: AugmentedVoteDataResponseT | undefined;
};

export type AugmentedVoteDataByKeyT = Record<
  UniqueKeyT,
  AugmentedVoteDataResponseT
>;

export type TransactionHashT = string;

export type RawDiscordMessageT = APIMessage;

export type RawDiscordThreadT = RawDiscordMessageT[];

export const RawDiscordMessageSchema = ss.type({
  id: ss.string(),
  content: ss.string(),
  thread: ss.optional(
    ss.type({
      id: ss.string(),
      name: ss.optional(ss.string()),
    })
  ),
});

export const RawDiscordThreadSchema = ss.array(RawDiscordMessageSchema);

export type ThreadIdMap = Record<string, string>;

export const DiscordMessageT: ss.Describe<{
  message: string;
  sender: string;
  senderPicture?: string;
  time: number;
  id: string;
  replies?: DiscordMessageT[];
}> = ss.object({
  message: ss.string(),
  sender: ss.string(),
  senderPicture: ss.optional(ss.string()),
  time: ss.number(),
  id: ss.string(),
  replies: ss.optional(ss.array(ss.lazy(() => DiscordMessageT))),
});
export type DiscordMessageT = ss.Infer<typeof DiscordMessageT>;

export const VoteDiscussionT = ss.type({
  identifier: ss.string(),
  time: ss.number(),
  thread: ss.array(DiscordMessageT),
});
export type VoteDiscussionT = ss.Infer<typeof VoteDiscussionT>;

export const L1Request = ss.object({
  time: ss.coerce(ss.number(), ss.union([ss.string(), ss.number()]), (value) =>
    Number(value)
  ),
  identifier: ss.string(),
  title: ss.string(),
});
export type L1Request = ss.Infer<typeof L1Request>;
