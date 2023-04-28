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
  usePagination,
} from "components";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function PastVotes() {
  const {
    pastVotesList,
    getUserIndependentIsLoading,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(pastVotesList);
  return (
    <Layout title="UMA | Past Votes">
      <Banner>Past Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {getUserIndependentIsLoading() ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <>
              <VotesTableWrapper>
                <VotesList
                  headings={<VotesTableHeadings activityStatus="past" />}
                  rows={entriesToShow.map((vote) => (
                    <VotesListItem
                      vote={vote}
                      phase={phase}
                      selectedVote={undefined}
                      selectVote={() => null}
                      clearVote={() => null}
                      activityStatus="past"
                      moreDetailsAction={() => openPanel("vote", vote)}
                      key={vote.uniqueKey}
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
  margin-block: 30px;
`;
