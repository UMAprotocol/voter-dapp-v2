import { VoteT } from "types";

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

export type PanelTypeT =
  | "menu"
  | "claim"
  | "vote"
  | "stake"
  | "history"
  | "remind"
  | "delegation"
  | null;

export type VotePanelContentT = VoteT;

export type PanelContentT = VotePanelContentT | null;

export type PaginateForT =
  | "activeVotesPage"
  | "upcomingVotesPage"
  | "pastVotesPage"
  | "voteHistoryPage";

export type PageStateT = {
  pageNumber: number;
  resultsPerPage: number;
};

export type PageStatesT = Record<PaginateForT, PageStateT>;

export type ErrorOriginT =
  | "default"
  | "vote"
  | "stake"
  | "unstake"
  | "claim"
  | "delegation"
  | "storybook";
