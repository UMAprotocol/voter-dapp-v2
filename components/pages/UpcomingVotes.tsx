import {
  Banner,
  Layout,
  LoadingSpinner,
  NextRoundStartsIn,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
} from "components";
import { getEntriesForPage } from "helpers";
import {
  usePaginationContext,
  usePanelContext,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import Image from "next/image";
import noVotesIndicator from "public/assets/no-votes-indicator.png";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function UpcomingVotes() {
  const {
    getUpcomingVotes,
    getUserIndependentIsLoading,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const {
    pageStates: {
      upcomingVotesPage: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();
  const upcomingVotes = getUpcomingVotes();
  const numberOfUpcomingVotes = upcomingVotes.length;
  const hasUpcomingVotes = numberOfUpcomingVotes > 0;
  const votesToShow = getEntriesForPage(
    pageNumber,
    resultsPerPage,
    upcomingVotes
  );

  return (
    <Layout title="UMA | Upcoming Votes">
      <Banner>Upcoming Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {getUserIndependentIsLoading() ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={300} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <>
              {hasUpcomingVotes ? (
                <>
                  <NextRoundStartsIn
                    phase={phase}
                    timeRemaining={millisecondsUntilPhaseEnds}
                  />
                  <VotesTableWrapper>
                    <VotesList
                      headings={
                        <VotesTableHeadings activityStatus="upcoming" />
                      }
                      rows={votesToShow.map((vote) => (
                        <VotesListItem
                          vote={vote}
                          phase={phase}
                          selectedVote={undefined}
                          selectVote={() => null}
                          activityStatus="upcoming"
                          moreDetailsAction={() => openPanel("vote", vote)}
                          key={vote.uniqueKey}
                          isFetching={getUserDependentIsFetching()}
                        />
                      ))}
                    />
                  </VotesTableWrapper>
                  {numberOfUpcomingVotes > 10 && (
                    <PaginationWrapper>
                      <Pagination
                        paginateFor="upcomingVotesPage"
                        numberOfEntries={numberOfUpcomingVotes}
                      />
                    </PaginationWrapper>
                  )}
                </>
              ) : (
                <NoVotesWrapper>
                  <NoVotesMessage>No upcoming votes</NoVotesMessage>
                  <Image
                    src={noVotesIndicator}
                    width={220}
                    height={220}
                    alt="No votes"
                  />
                </NoVotesWrapper>
              )}
            </>
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}

const VotesTableWrapper = styled.div`
  margin-top: 35px;
`;

const PaginationWrapper = styled.div`
  margin-top: 10px;
`;

const NoVotesWrapper = styled.div`
  display: grid;
  justify-items: center;
  align-items: top;
  gap: 40px;
`;

const NoVotesMessage = styled.h1`
  font: var(--header-lg);
  font-weight: 300;
`;
