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
  // decoded values
  timeMilliseconds: number;
  decodedIdentifier: string;
  decodedAncillaryData: string;
};

export type VoteT = PriceRequest & VoteDetailsT & VoteResultT;

export type VoteDetailsT = {
  identifier: string;
  title: string;
  origin: DisputeOriginT;
  txid: string;
  isCommitted: boolean;
  isGovernance: boolean;
  voteNumber: number;
  umipNumber: number;
  description: string;
  options: DropdownItemT[];
  timestamp: Date;
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
}

export type SigningKeys = {
  [address: string]: SigningKey;
}