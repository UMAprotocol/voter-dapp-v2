import {
  Pagination,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
  VoteTimeline,
} from "components";
import { defaultResultsPerPage } from "constant";
import {
  useDelegationContext,
  usePanelContext,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import { useEffect, useState } from "react";
import { Divider, PaginationWrapper, Title, VotesListWrapper } from "./style";

export function UpcomingVotes() {
  const { upcomingVotesList, getActivityStatus, getUserDependentIsFetching } =
    useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { getDelegationStatus } = useDelegationContext();
  const [votesToShow, setVotesToShow] = useState(upcomingVotesList);

  useEffect(() => {
    if (upcomingVotesList.length <= defaultResultsPerPage) {
      setVotesToShow(upcomingVotesList);
    }
  }, [upcomingVotesList]);

  return (
    <>
      <Title>Upcoming votes:</Title>
      {getActivityStatus() === "upcoming" && <VoteTimeline />}
      <VotesListWrapper>
        <VotesList
          headings={<VotesTableHeadings activityStatus="upcoming" />}
          rows={votesToShow.map((vote) => (
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
      </VotesListWrapper>
      {upcomingVotesList.length > defaultResultsPerPage && (
        <PaginationWrapper>
          <Pagination
            entries={upcomingVotesList}
            setEntriesToShow={setVotesToShow}
          />
        </PaginationWrapper>
      )}
      <Divider />
    </>
  );
}
