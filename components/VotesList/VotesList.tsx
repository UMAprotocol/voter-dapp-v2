import { hideOnMobileAndUnder, showOnMobileAndUnder } from "helpers";
import styled from "styled-components";
import {
  ActivityStatusT,
  DelegationStatusT,
  SelectedVotesByKeyT,
  UniqueIdT,
  VotePhaseT,
  VoteT,
} from "types";
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
  return (
    <>
      <DesktopWrapper>
        <VotesDesktop {...props} />
      </DesktopWrapper>
      <MobileWrapper>
        <VotesMobile {...props} />
      </MobileWrapper>
    </>
  );
}

const DesktopWrapper = styled.div`
  ${hideOnMobileAndUnder}
`;

const MobileWrapper = styled.div`
  ${showOnMobileAndUnder}
`;
