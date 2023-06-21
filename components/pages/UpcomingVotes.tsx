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
  const { upcomingVoteList } = useVotesContext();
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

  return (
    <Layout title="UMA | Upcoming Votes">
      <Banner>Upcoming Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {isUndefined(upcomingVoteList) ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
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
