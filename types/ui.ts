export type InputDataT = {
  value: string | number;
  label: string;
  formattedValue?: Record<string, string> | undefined | string;
};

export type LinkT = {
  href: string;
  label: string;
};

export type DropdownItemT = InputDataT & {
  action?: string | undefined;
  secondaryLabel?: string;
};

export type PanelTypeT =
  | "menu"
  | "claim"
  | "claimV1"
  | "vote"
  | "stake"
  | "history"
  | "remind"
  | "delegation";

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
  | "claimV1"
  | "delegation"
  | "storybook"
  | "remind";
