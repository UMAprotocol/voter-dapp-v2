import { BigNumber } from "ethers";

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
  uniqueKey: string;
};

export type WithIsGovernanceT<T extends PriceRequestT> = T & {
  isGovernance: boolean;
};

export type WithIsCommittedT<T extends PriceRequestT> = T & {
  isCommitted: boolean;
};

export type WithIsRevealedT<T extends PriceRequestT> = T & {
  isRevealed: boolean;
};

export type WithEncryptedVoteT<T extends WithIsCommittedT<PriceRequestT>> = T & {
  encryptedVote: string | undefined;
};

export type WithDecryptedVoteT<T extends WithEncryptedVoteT<WithIsCommittedT<PriceRequestT>>> = T & {
  decryptedVote: DecryptedVoteT | undefined;
};

export type WithUmipDataFromContentfulT<T extends PriceRequestT> = T & {
  umipDataFromContentful: UmipDataFromContentfulT | undefined;
};

export type WithMetaDataT<T extends WithUmipDataFromContentfulT<PriceRequestT>> = T & VoteMetaDataT;

export type WithAllDataT = WithIsGovernanceT<PriceRequestT> &
  WithIsCommittedT<PriceRequestT> &
  WithEncryptedVoteT<WithIsCommittedT<PriceRequestT>> &
  WithDecryptedVoteT<WithEncryptedVoteT<WithIsCommittedT<PriceRequestT>>> &
  WithIsRevealedT<PriceRequestT> &
  WithUmipDataFromContentfulT<PriceRequestT> &
  WithMetaDataT<WithUmipDataFromContentfulT<PriceRequestT>>;

export type VoteT = WithAllDataT & VoteResultT;

export type DecryptedVoteT = { price: string; salt: string };

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

export type UmipDataFromContentfulT = {
  description: string;
  discourseLink?: string;
  status?: string;
  authors?: string;
  title: string;
  number: number;
  umipLink?: string;
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

export type UniqueKeyT = string;
export type EncryptedVoteT = string;
export type VoteExistsByKeyT = Record<UniqueKeyT, boolean>;
export type ActiveVotesByKeyT = Record<UniqueKeyT, PriceRequestT>;
export type UserEncryptedVotesByKeyT = Record<UniqueKeyT, EncryptedVoteT>;
export type UserDecryptedVotesByKeyT = Record<UniqueKeyT, DecryptedVoteT>;
export type ContentfulDataByProposalNumberT = Record<UniqueKeyT, UmipDataFromContentfulT>;
