import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber, ethers } from "ethers";

export type InputDataT = {
  value: string | number;
  label: string;
};

export type LinkT = {
  href: string;
  label: string;
};

export type DropdownItemT = InputDataT & {
  secondaryLabel?: string;
};

export type VoteT = PriceRequestT & UserVoteDataT & VoteMetaDataT & VoteContentfulDataT & VoteResultT;

export type PriceRequestT = {
  // raw values
  time: number;
  identifier: string;
  ancillaryData: string;
  transactionHash: string;
  // computed values
  timeMilliseconds: number;
  timeAsDate: Date;
  decodedIdentifier: string;
  decodedAncillaryData: string;
  uniqueKey: UniqueKeyT;
};

export type PriceRequestByKeyT = Record<UniqueKeyT, PriceRequestT>;

export type UserVoteDataT = {
  isCommitted: boolean;
  isRevealed: boolean;
  encryptedVote: EncryptedVoteT | undefined;
  decryptedVote: DecryptedVoteT | undefined;
};

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
};

export type VoteResultT = {
  results?: InputDataT[];
  participation?: InputDataT[];
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

export type ContentfulDataByProposalNumberT = Record<UniqueKeyT, ContentfulDataT | undefined>;

export type UniqueKeyT = string;

export type EncryptedVoteT = string;
export type EncryptedVotesByKeyT = Record<UniqueKeyT, EncryptedVoteT | undefined>;

export type DecryptedVoteT = { price: string; salt: string };
export type DecryptedVotesByKeyT = Record<UniqueKeyT, DecryptedVoteT | undefined>;

export type VoteExistsByKeyT = Record<UniqueKeyT, boolean | undefined>;

export type SelectedVotesByKeyT = Record<UniqueKeyT, string | undefined>;

export type VotePhaseT = "commit" | "reveal" | null;

export type VoteTimelineT = {
  phase: VotePhaseT;
  phaseEnds: Date;
};

export type VoteOriginT = "UMA" | "Polymarket";

export type PanelTypeT = "menu" | "claim" | "vote" | "stake" | "history" | "remind" | null;

export type VotePanelContentT = VoteT;

export type PanelContentT = VotePanelContentT | null;

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

export type StakerDetailsT = {
  activeStake: BigNumber;
  pendingUnstake: BigNumber;
  pendingStake: BigNumber;
  rewardsPaidPerToken: BigNumber;
  outstandingRewards: BigNumber;
  unappliedSlash: BigNumber;
  lastRequestIndexConsidered: BigNumber;
  unstakeRequestTime: BigNumber;
  delegate: string;
};

export type FormatVotesToCommit = {
  votes: VoteT[];
  selectedVotes: SelectedVotesByKeyT;
  roundId: number;
  address: string;
  signingKeys: SigningKeys;
  signer: ethers.Signer;
};

export type CommitVotes = FormatVotesToCommit & {
  voting: VotingV2Ethers;
};

export type RevealVotes = {
  votes: VoteT[];
  voting: VotingV2Ethers;
};
