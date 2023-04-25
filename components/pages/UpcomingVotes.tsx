import {
  Banner,
  Layout,
  LoadingSpinner,
  NextRoundStartsIn,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VoteList,
  VoteListItem,
  VoteTableHeadings,
} from "components";
import { defaultResultsPerPage } from "constant";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import Image from "next/image";
import noVotesIndicator from "public/assets/no-votes-indicator.png";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function UpcomingVotes() {
  const {
    upcomingVoteList,
    getUserIndependentIsLoading,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const [votesToShow, setVotesToShow] = useState(upcomingVoteList);
  const numberOfUpcomingVotes = upcomingVoteList.length;
  const hasUpcomingVotes = numberOfUpcomingVotes > 0;

  useEffect(() => {
    if (upcomingVoteList.length <= defaultResultsPerPage) {
      setVotesToShow(upcomingVoteList);
    }
  }, [upcomingVoteList]);

  return (
    <Layout title="UMA | Upcoming Votes">
      <Banner>Upcoming Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {getUserIndependentIsLoading() ? (
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
                    <VoteList
                      headings={<VoteTableHeadings activityStatus="upcoming" />}
                      rows={votesToShow.map((vote) => (
                        <VoteListItem
                          vote={vote}
                          phase={phase}
                          selectedVote={undefined}
                          selectVote={() => null}
                          clearVote={() => null}
                          activityStatus="upcoming"
                          moreDetailsAction={() => openPanel("vote", vote)}
                          key={vote.uniqueKey}
                          isFetching={getUserDependentIsFetching()}
                        />
                      ))}
                    />
                  </VotesTableWrapper>
                  {numberOfUpcomingVotes > defaultResultsPerPage && (
                    <PaginationWrapper>
                      <Pagination
                        entries={votesToShow}
                        setEntriesToShow={setVotesToShow}
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
