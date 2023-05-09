import {
  Pagination,
  usePagination,
  VoteList,
  VoteListItem,
  VoteTableHeadings,
  VoteTimeline,
} from "components";
import { usePanelContext, useVotesContext, useVoteTimingContext } from "hooks";
import { Divider, PaginationWrapper, Title, VotesTableWrapper } from "./style";

export function UpcomingVotes() {
  const { upcomingVoteList, activityStatus } = useVotesContext();
  const { openPanel } = usePanelContext();
  const { phase } = useVoteTimingContext();
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    upcomingVoteList ?? []
  );

  return (
    <>
      <Title>Upcoming votes:</Title>
      {activityStatus === "upcoming" && <VoteTimeline />}
      <VotesTableWrapper>
        <VoteList
          headings={<VoteTableHeadings activityStatus="upcoming" />}
          rows={entriesToShow.map((vote) => (
            <VoteListItem
              phase={phase}
              vote={vote}
              activityStatus="upcoming"
              moreDetailsAction={() => openPanel("vote", vote)}
              key={vote.uniqueKey}
            />
          ))}
        />
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
