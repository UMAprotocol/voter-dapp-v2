import { Pagination, VotesList, VoteTimeline } from "components";
import { defaultResultsPerPage } from "constant";
import { ActionButtons } from "./ActionButtons";
import {
  Divider,
  PaginationWrapper,
  RecommittingVotesMessage,
  Title,
  VotesListWrapper,
} from "./style";
import { useVotes } from "./useVotes";

export function ActiveVotes() {
  const {
    votesList,
    setVotesToShow,
    resetSelectedVotes,
    isAnyDirty,
    actionStatus,
    ...voteListProps
  } = useVotes("active");

  return (
    <>
      <Title>Active votes:</Title>
      <VoteTimeline />
      <VotesListWrapper>
        <VotesList {...voteListProps} />
      </VotesListWrapper>
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
