import { Pagination, VoteList, VoteTimeline, usePagination } from "components";
import { ActionButtons } from "components/Votes/ActionButtons";
import { useVoteList } from "../VoteList/shared/useVoteList";
import {
  Divider,
  PaginationWrapper,
  RecommittingVotesMessage,
  Title,
  VoteListWrapper,
} from "./style.shared";

export function ActiveVotes() {
  const voteListProps = useVoteList("active");
  const { voteList, resetSelectedVotes, isAnyDirty, actionStatus } =
    voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(voteList);

  return (
    <>
      <Title>Active votes:</Title>
      <VoteTimeline />
      <VoteListWrapper>
        <VoteList {...voteListProps} votesToShow={entriesToShow} />
      </VoteListWrapper>
      {showPagination && (
        <PaginationWrapper>
          <Pagination {...paginationProps} />
        </PaginationWrapper>
      )}
      {isAnyDirty ? (
        <RecommittingVotesMessage>
          * Changes to committed votes need to be re-committed
        </RecommittingVotesMessage>
      ) : null}
      <ActionButtons
        actionStatus={actionStatus}
        isAnyDirty={isAnyDirty}
        resetSelectedVotes={resetSelectedVotes}
      />
      <Divider />
    </>
  );
}
