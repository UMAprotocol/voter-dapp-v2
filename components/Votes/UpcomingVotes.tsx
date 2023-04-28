import {
  Pagination,
  usePagination,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
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
  const { upcomingVotesList, getActivityStatus, getUserDependentIsFetching } =
    useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { getDelegationStatus } = useDelegationContext();
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(upcomingVotesList);

  return (
    <>
      <Title>Upcoming votes:</Title>
      {getActivityStatus() === "upcoming" && <VoteTimeline />}
      <VotesTableWrapper>
        <VotesList
          headings={<VotesTableHeadings activityStatus="upcoming" />}
          rows={entriesToShow.map((vote) => (
            <VotesListItem
              vote={vote}
              phase={phase}
              activityStatus="upcoming"
              moreDetailsAction={() => openPanel("vote", vote)}
              key={vote.uniqueKey}
              delegationStatus={getDelegationStatus()}
              isFetching={getUserDependentIsFetching()}
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
