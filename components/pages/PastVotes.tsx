import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  VotesTable,
  VotesTableHeadings,
  VotesTableRow,
  VoteTimeline,
} from "components";
import { usePanelContext, useVotesContext, useVoteTimingContext } from "hooks";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function PastVotes() {
  const { getPastVotes, getUserIndependentIsLoading, getUserDependentIsFetching } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();

  console.log(getPastVotes());

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
              <VoteTimeline />
              <VotesTableWrapper>
                <VotesTable
                  headings={<VotesTableHeadings activityStatus="past" />}
                  rows={getPastVotes().map((vote) => (
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
