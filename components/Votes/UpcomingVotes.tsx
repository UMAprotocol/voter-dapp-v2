import {
  Pagination,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
} from "components";
import { defaultResultsPerPage } from "constant";
import { getEntriesForPage } from "helpers";
import {
  usePaginationContext,
  usePanelContext,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import { ReactNode } from "react";
import styled from "styled-components";
import { VoteT } from "types";

export function UpcomingVotes({
  votes,
  children,
}: {
  votes: VoteT[];
  children?: ReactNode;
}) {
  const { openPanel } = usePanelContext();
  const { phase } = useVoteTimingContext();
  const { getUserDependentIsFetching } = useVotesContext();
  function openVotePanel(vote: VoteT) {
    openPanel("vote", vote);
  }
  const {
    pageStates: {
      upcomingVotesPage: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();
  const votesToShow = getEntriesForPage(pageNumber, resultsPerPage, votes);
  return (
    <>
      <Title>Upcoming votes:</Title>
      {children}
      <VotesTableWrapper>
        <VotesList
          headings={<VotesTableHeadings activityStatus="upcoming" />}
          rows={votesToShow.map((vote) => (
            <VotesListItem
              vote={vote}
              phase={phase}
              selectedVote={undefined}
              selectVote={() => null}
              activityStatus="upcoming"
              moreDetailsAction={() => openVotePanel(vote)}
              key={vote.uniqueKey}
              isFetching={getUserDependentIsFetching()}
            />
          ))}
        />
      </VotesTableWrapper>
      {votes.length > defaultResultsPerPage && (
        <PaginationWrapper>
          <Pagination
            paginateFor="upcomingVotesPage"
            numberOfEntries={votes.length}
          />
        </PaginationWrapper>
      )}
    </>
  );
}

const VotesTableWrapper = styled.div`
  margin-top: var(--margin-top, 35px);
`;

const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

const PaginationWrapper = styled.div`
  margin-block: 30px;
`;
