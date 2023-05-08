import {
  Pagination,
  usePagination,
  VoteList,
  VoteListItem,
  VoteTableHeadings,
  VoteTimeline,
} from "components";
import {
  useDelegationContext,
  usePanelContext,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import { Divider, PaginationWrapper, Title, VotesTableWrapper } from "./style";

export function UpcomingVotes() {
  const { upcomingVoteList, activityStatus, isActive, isPast } =
    useVotesContext();
  const { isCommit, isReveal } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { isDelegate, isDelegator } = useDelegationContext();
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
              vote={vote}
              activityStatus="upcoming"
              moreDetailsAction={() => openPanel("vote", vote)}
              key={vote.uniqueKey}
              isDelegate={isDelegate}
              isDelegator={isDelegator}
              isActive={isActive}
              isPast={isPast}
              isCommit={isCommit}
              isReveal={isReveal}
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
