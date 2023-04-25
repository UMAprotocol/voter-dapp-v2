import {
  Pagination,
  VoteList,
  VoteListItem,
  VoteTableHeadings,
  VoteTimeline,
} from "components";
import { defaultResultsPerPage } from "constant";
import {
  useDelegationContext,
  usePanelContext,
  useVoteTimingContext,
  useVotesContext,
} from "hooks";
import { useEffect, useState } from "react";
import { Divider, PaginationWrapper, Title, VoteListWrapper } from "./style";

export function UpcomingVotes() {
  const { upcomingVoteList, getActivityStatus, getUserDependentIsFetching } =
    useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { getDelegationStatus } = useDelegationContext();
  const [votesToShow, setVotesToShow] = useState(upcomingVoteList);

  useEffect(() => {
    if (upcomingVoteList.length <= defaultResultsPerPage) {
      setVotesToShow(upcomingVoteList);
    }
  }, [upcomingVoteList]);

  return (
    <>
      <Title>Upcoming votes:</Title>
      {getActivityStatus() === "upcoming" && <VoteTimeline />}
      <VoteListWrapper>
        <VoteList
          headings={<VoteTableHeadings activityStatus="upcoming" />}
          rows={votesToShow.map((vote) => (
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
      </VoteListWrapper>
      {upcomingVoteList.length > defaultResultsPerPage && (
        <PaginationWrapper>
          <Pagination
            entries={upcomingVoteList}
            setEntriesToShow={setVotesToShow}
          />
        </PaginationWrapper>
      )}
      <Divider />
    </>
  );
}
