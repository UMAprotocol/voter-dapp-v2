import {
  Banner,
  Layout,
  LoadingSpinner,
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
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function UpcomingVotes() {
  const {
    getUpcomingVotes,
    getUserIndependentIsLoading,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const {
    pageStates: {
      upcomingVotesPage: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();

  const upcomingVotes = getUpcomingVotes();
  const numberOfUpcomingVotes = UpcomingVotes.length;
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
