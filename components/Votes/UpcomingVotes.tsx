import { Pagination, usePagination, VoteList, VoteTimeline } from "components";
import { usePanelContext, useVotesContext, useVoteTimingContext } from "hooks";
import { Divider, PaginationWrapper, Title, VotesTableWrapper } from "./style";

export function UpcomingVotes() {
  const { upcomingVoteList, activityStatus } = useVotesContext();
  const { openPanel } = usePanelContext();
  const { phase } = useVoteTimingContext();
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    upcomingVoteList ?? []
  );

  const data = entriesToShow.map((vote) => ({
    activityStatus: "upcoming" as const,
    vote,
    phase,
    moreDetailsAction: () => openPanel("vote", vote),
  }));

  return (
    <>
      <Title>Upcoming votes:</Title>
      {activityStatus === "upcoming" && <VoteTimeline />}
      <VotesTableWrapper>
        <VoteList activityStatus="upcoming" data={data} />
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
