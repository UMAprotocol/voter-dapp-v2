import {
  NextRoundStartsIn,
  Pagination,
  usePagination,
  useVoteList,
  VoteList,
} from "components";
import { useVoteTimingContext } from "hooks";
import { Divider, PaginationWrapper, Title, VotesTableWrapper } from "./style";

export function UpcomingVotes() {
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const voteListProps = useVoteList("upcoming");
  const { voteList } = voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(voteList);

  return (
    <>
      <Title>Upcoming votes:</Title>
      <NextRoundStartsIn
        phase={phase}
        timeRemaining={millisecondsUntilPhaseEnds}
      />
      <VotesTableWrapper>
        <VoteList votesToShow={entriesToShow} {...voteListProps} />
      </VotesTableWrapper>
      {showPagination && (
        <PaginationWrapper>
          <Pagination {...paginationProps} />
        </PaginationWrapper>
      )}
      <Divider />
    </>
  );
}
