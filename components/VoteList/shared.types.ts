import { ActivityStatusT, VotePhaseT, VoteT } from "types";

export interface VoteListItemProps {
  vote: VoteT;
  phase: VotePhaseT;
  selectedVote?: string | undefined;
  selectVote?: (value: string | undefined) => void;
  clearVote?: () => void;
  activityStatus: ActivityStatusT | undefined;
  moreDetailsAction: () => void;
  setDirty?: (dirty: boolean) => void;
  isDirty?: boolean;
  darkMode?: boolean;
}
