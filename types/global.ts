export type InputDataT = {
  value: string;
  label: string;
};

export type LinkT = {
  href: string;
  label: string;
};

export type DropdownItemT = InputDataT & {
  secondaryLabel?: string;
};

export type DisputeT = {
  title: string;
  origin: DisputeOrigins;
  number: number;
  description: string;
  timestamp: Date;
  txid: string;
  umipNumber: number;
};

export enum DisputeOrigins {
  UMA = "UMA",
  Polymarket = "Polymarket",
}

export type VoteT = {
  dispute: DisputeT;
  voteOptions: DropdownItemT[];
  isCommitted: boolean;
};

export type VoteTimelineT = {
  phase: "commit" | "reveal" | null;
  commitPhaseStart: Date | null;
  revealPhaseStart: Date | null;
  commitPhaseEnd: Date | null;
  revealPhaseEnd: Date | null;
};

export type PanelTypeT = "menu" | "claim" | "vote" | "stake" | "history" | "remind" | null;

export type VoteDetailsT = {
  description: string;
  options: string[];
  timestamp: Date;
  links: LinkT[];
  discordLink: string;
};

export type VoteResultT = {
  results: InputDataT[];
  participation: InputDataT[];
};

export type VotePanelContentT = VoteDetailsT &
  VoteResultT & {
    title: string;
    origin: DisputeOrigins;
    disputeNumber: number;
  };

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
