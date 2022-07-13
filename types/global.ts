export type DropdownItemT = {
  value: string;
  label: string;
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

export type PanelTypeT = "claim" | "vote" | "stake" | "history" | "remind" | null;

export type VotePanelContentT = {
  title: string;
  origin: DisputeOrigins;
  disputeNumber: number;
  description: string;
  options: string[];
  timestamp: Date;
  links: { href: string; label: string }[];
  discordLink: string;
};

export type PanelContentT = VotePanelContentT | null;
