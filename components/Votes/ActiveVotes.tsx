import { Pagination, VoteList, VoteTimeline, usePagination } from "components";
import { ActionButtons } from "./ActionButtons";
import {
  Divider,
  PaginationWrapper,
  RecommittingVotesMessage,
  Title,
  VoteListWrapper,
} from "./style";
import { useVoteList } from "./useVoteList";

export function ActiveVotes() {
  const voteListProps = useVoteList("active");
  const { votesList, resetSelectedVotes, isAnyDirty, actionStatus } =
    voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(votesList);

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
