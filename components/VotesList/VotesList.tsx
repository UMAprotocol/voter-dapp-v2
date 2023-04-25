import { tabletMax } from "constant";
import {
  ActivityStatusT,
  DelegationStatusT,
  SelectedVotesByKeyT,
  UniqueIdT,
  VotePhaseT,
  VoteT,
} from "types";
import { useWindowSize } from "usehooks-ts";
import { VotesDesktop } from "./VotesDesktop";
import { VotesMobile } from "./VotesMobile";

export interface VotesListProps {
  votesToShow: VoteT[] | undefined;
  activityStatus: ActivityStatusT;
  phase: VotePhaseT;
  selectedVotes: SelectedVotesByKeyT;
  delegationStatus: DelegationStatusT;
  isFetching: boolean;
  selectVote: (value: string | undefined, vote: VoteT) => void;
  clearSelectedVote: (vote: VoteT) => void;
  moreDetailsAction: (vote: VoteT) => void;
  isDirty: (uniqueKey: UniqueIdT) => boolean;
  setDirty: (dirty: boolean, uniqueKey: UniqueIdT) => void;
}
export function VotesList(props: VotesListProps) {
  const { width } = useWindowSize();

  if (width === undefined || width === 0) return null;

  const isMobile = width <= tabletMax;
  const isDesktop = width > tabletMax;

  return (
    <>
      {isDesktop && <VotesDesktop {...props} />}
      {isMobile && <VotesMobile {...props} />}
    </>
  );
}
