import { Pagination, VoteList, VoteTimeline } from "components";
import { defaultResultsPerPage } from "constant";
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
  const {
    votesList,
    setVotesToShow,
    resetSelectedVotes,
    isAnyDirty,
    actionStatus,
  } = voteListProps;

  return (
    <>
      <Title>Active votes:</Title>
      <VoteTimeline />
      <VoteListWrapper>
        <VoteList {...voteListProps} />
      </VoteListWrapper>
      {votesList.length > defaultResultsPerPage && (
        <PaginationWrapper>
          <Pagination entries={votesList} setEntriesToShow={setVotesToShow} />
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
