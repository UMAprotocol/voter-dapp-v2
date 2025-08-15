import {
  Banner,
  Layout,
  LoadingSpinner,
  NextRoundStartsIn,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VoteList,
  usePagination,
} from "components";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import { isUndefined } from "lodash";
import Image from "next/image";
import noVotesIndicator from "public/assets/no-votes-indicator.png";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function UpcomingVotes() {
  const { upcomingVoteList, upcomingVotesIsLoading } = useVotesContext();
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    upcomingVoteList ?? []
  );
  const hasUpcomingVotes = !!upcomingVoteList && upcomingVoteList?.length > 0;

  const data = entriesToShow.map((vote) => ({
    activityStatus: "upcoming" as const,
    vote,
    phase,
    moreDetailsAction: () => openPanel("vote", vote),
  }));

  const isLoading = upcomingVotesIsLoading || isUndefined(upcomingVoteList);

  return (
    <Layout title="UMA | Upcoming Votes">
      <Banner>Upcoming Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {isLoading ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
              <LoadingText>Loading upcoming votes...</LoadingText>
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
                    <VoteList activityStatus="upcoming" data={data} />
                  </VotesTableWrapper>
                  {showPagination && (
                    <PaginationWrapper>
                      <Pagination {...paginationProps} />
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
  margin-block: 30px;
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

const LoadingText = styled.div`
  margin-top: 20px;
  font: var(--text-md);
  color: var(--grey-800);
  text-align: center;
`;
