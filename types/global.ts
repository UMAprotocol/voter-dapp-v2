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

export type WithIsGovernanceT = PriceRequestT & {
  isGovernance: boolean;
};

export type WithIsCommittedT = WithIsGovernanceT & {
  isCommitted: boolean;
};

export type WithIsRevealedT = WithIsCommittedT & {
  isRevealed: boolean;
};

export type WithEncryptedVoteT = WithIsRevealedT & {
  encryptedVote: string | undefined;
};

export type WithDecryptedVoteT = WithEncryptedVoteT & {
  decryptedVote: DecryptedVoteT | undefined;
};

export type WithUmipDataFromContentfulT = WithDecryptedVoteT & {
  umipDataFromContentful: UmipDataFromContentfulT | undefined;
};

export type WithMetaDataT = WithUmipDataFromContentfulT & VoteMetaDataT;

export type VoteT = WithIsCommittedT & WithIsRevealedT & WithDecryptedVoteT & WithMetaDataT & VoteResultT;

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

export type ClaimPanelContentT = {
  claimableRewards: number;
};

export type StakePanelContentT = {
  stakedBalance: number;
  unstakedBalance: number;
  cooldownEnds: Date;
  claimableRewards: number;
};

export type PanelContentT = VotePanelContentT | ClaimPanelContentT | StakePanelContentT | null;

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
