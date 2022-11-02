import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VotesTable,
  VotesTableHeadings,
  VotesTableRow,
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

export function PastVotes() {
  const {
    getPastVotes,
    getUserIndependentIsLoading,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const {
    pageStates: {
      pastVotesPage: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();

  const pastVotes = getPastVotes();
  const numberOfPastVotes = pastVotes.length;
  const votesToShow = getEntriesForPage(pageNumber, resultsPerPage, pastVotes);

  return (
    <Layout>
      <Banner>Past Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {getUserIndependentIsLoading() ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={300} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <>
              <VotesTableWrapper>
                <VotesTable
                  headings={<VotesTableHeadings activityStatus="past" />}
                  rows={votesToShow.map((vote) => (
                    <VotesTableRow
                      vote={vote}
                      phase={phase}
                      selectedVote={undefined}
                      selectVote={() => null}
                      activityStatus="past"
                      moreDetailsAction={() => openPanel("vote", vote)}
                      key={vote.uniqueKey}
                      isFetching={getUserDependentIsFetching()}
                    />
                  ))}
                />
              </VotesTableWrapper>
              <PaginationWrapper>
                <Pagination
                  paginateFor="pastVotesPage"
                  numberOfEntries={numberOfPastVotes}
                />
              </PaginationWrapper>
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
