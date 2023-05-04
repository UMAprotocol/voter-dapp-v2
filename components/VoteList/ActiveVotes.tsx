import { Pagination, VoteList, VoteTimeline, usePagination } from "components";
import {
  Divider,
  PaginationWrapper,
  RecommittingVotesMessage,
  Title,
  VoteListWrapper,
} from "../Votes/style";
import { ActionButtons } from "./ActionButtons";
import { useVoteList } from "./useVoteList";

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
