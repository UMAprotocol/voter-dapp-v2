import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VoteList,
  VoteListItem,
  VoteTableHeadings,
} from "components";
import { defaultResultsPerPage } from "constant";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function PastVotes() {
  const {
    pastVoteList,
    getUserIndependentIsLoading,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const [votesToShow, setVotesToShow] = useState(pastVoteList);
  const numberOfPastVotes = pastVoteList.length;

  useEffect(() => {
    if (pastVoteList.length <= defaultResultsPerPage) {
      setVotesToShow(pastVoteList);
    }
  }, [pastVoteList]);
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
                <VoteList
                  headings={<VoteTableHeadings activityStatus="past" />}
                  rows={votesToShow.map((vote) => (
                    <VoteListItem
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
              {numberOfPastVotes > defaultResultsPerPage && (
                <PaginationWrapper>
                  <Pagination
                    entries={pastVoteList}
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
