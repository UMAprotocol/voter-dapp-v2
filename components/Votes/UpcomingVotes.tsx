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
  const {
    activityStatus,
    voteListsByActivityStatus,
    getUserDependentIsFetching,
  } = useVotesContext();
  const voteList = voteListsByActivityStatus.upcoming;
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { getDelegationStatus } = useDelegationContext();
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(voteList);

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
