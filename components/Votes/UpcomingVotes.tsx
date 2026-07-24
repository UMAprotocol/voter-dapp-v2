import { Pagination, usePagination, VoteList, VoteTimeline } from "components";
import {
  useDeeplinkedVoteIndex,
  useVotesContext,
  useVoteTimingContext,
  useVoteUrl,
} from "hooks";
import { Divider, PaginationWrapper, Title, VotesTableWrapper } from "./style";

export function UpcomingVotes() {
  const { upcomingVoteList, activityStatus } = useVotesContext();
  const { openVote } = useVoteUrl();
  const { phase } = useVoteTimingContext();
  const deeplinkedVoteIndex = useDeeplinkedVoteIndex(upcomingVoteList);
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    upcomingVoteList ?? [],
    deeplinkedVoteIndex
  );

  const data = entriesToShow.map((vote) => ({
    activityStatus: "upcoming" as const,
    vote,
    phase,
    moreDetailsAction: () => openVote(vote.uniqueKey),
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
