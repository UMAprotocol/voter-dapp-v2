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
import { defaultResultsPerPage } from "constant";
import { usePanelContext, useVotesContext, useVoteTimingContext } from "hooks";
import { useEffect, useState } from "react";
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
  const [votesToShow, setVotesToShow] = useState(pastVotesList);
  const numberOfPastVotes = pastVotesList.length;

  useEffect(() => {
    if (pastVotesList.length <= defaultResultsPerPage) {
      setVotesToShow(pastVotesList);
    }
  }, [pastVotesList]);
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
                  rows={votesToShow.map((vote) => (
                    <VotesListItem
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
              {numberOfPastVotes > defaultResultsPerPage && (
                <PaginationWrapper>
                  <Pagination
                    entries={pastVotesList}
                    setEntriesToShow={setVotesToShow}
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
  margin-block: 30px;
`;
