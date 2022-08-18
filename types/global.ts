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

export type PriceRequest = {
  // raw values
  time: number;
  identifier: string;
  ancillaryData: string;
  // computed values
  timeMilliseconds: number;
  timeAsDate: Date;
  decodedIdentifier: string;
  decodedAncillaryData: string;
  uniqueKey: string;
};

export type PriceRequestWithIsCommitted = PriceRequest & {
  isCommitted: boolean;
};

export type PriceRequestWithIsRevealed = PriceRequest & {
  isRevealed: boolean;
};

export type PriceRequestWithEncryptedVote = PriceRequest & {
  encryptedVote: string | undefined;
};

export type PriceRequestWithDecryptedVote = PriceRequestWithEncryptedVote & {
  decryptedVote: DecryptedVoteT | undefined;
};

export type PriceRequestWithVoteDetails = PriceRequest & VoteDetailsT;

export type VoteT = PriceRequestWithIsCommitted &
  PriceRequestWithIsRevealed &
  PriceRequestWithDecryptedVote &
  PriceRequestWithVoteDetails &
  VoteResultT;

export type DecryptedVoteT = { price: string; salt: string };

export type VoteDetailsT = {
  title: string;
  origin: DisputeOriginT;
  txid: string;
  isGovernance: boolean;
  umipNumber: number;
  description: string;
  options: DropdownItemT[];
  links: LinkT[];
  discordLink: string;
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

export type DisputeOriginT = "UMA" | "Polymarket";

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

export type UnstakeDetailsT = {
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
