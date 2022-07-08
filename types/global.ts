import { ClaimPanel, VotePanel } from "components/Panel";

export type DropdownItemT = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

export type DisputeT = {
  title: string;
  origin: DisputeOrigins;
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

export type PanelComponentT = typeof ClaimPanel | typeof VotePanel | null;

export type PanelContentT = {
  title: string;
  description: string;
} | null;
