import { ChangeEvent } from "react";
import { ActivityStatusT, VotePhaseT, VoteT } from "types";

export interface VoteListItemProps {
  vote: VoteT;
  phase: VotePhaseT;
  selectedVote?: string | undefined;
  selectVote?: (value: string | undefined) => void;
  clearVote?: () => void;
  showLeaveUnrevealedToggle?: boolean;
  leaveUnrevealedChecked?: boolean;
  onLeaveUnrevealedChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  activityStatus: ActivityStatusT | undefined;
  moreDetailsAction: () => void;
  setDirty?: (dirty: boolean) => void;
  isDirty?: boolean;
}
