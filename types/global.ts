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

export type VoteT = {
  data: VoteDataT;
  isCommitted: boolean;
};

export type VoteDataT = VoteDetailsT & VoteResultT;

export type VoteDetailsT = {
  title: string;
  origin: DisputeOrigins;
  txid: string;
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

export type VoteTimelineT = {
  phase: "commit" | "reveal" | null;
  commitPhaseStart: Date | null;
  revealPhaseStart: Date | null;
  commitPhaseEnd: Date | null;
  revealPhaseEnd: Date | null;
};

export enum DisputeOrigins {
  UMA = "UMA",
  Polymarket = "Polymarket",
}

export type PanelTypeT = "menu" | "claim" | "vote" | "stake" | "history" | "remind" | null;

export type VotePanelContentT = VoteDataT;

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
