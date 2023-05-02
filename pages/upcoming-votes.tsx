import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  UpcomingVotes,
} from "components";
import { LoadingSpinnerWrapper } from "components/style";
import { useVotesContext } from "hooks";
import type { NextPage } from "next";
import Image from "next/image";
import noVotesIndicator from "public/assets/no-votes-indicator.png";
import styled from "styled-components";

const UpcomingVotesPage: NextPage = () => {
  const { getUserIndependentIsLoading, upcomingVoteList } = useVotesContext();
  const isLoading = getUserIndependentIsLoading();
  const hasUpcomingVotes = upcomingVoteList.length > 0;

  return (
    <Layout title="UMA | Upcoming Votes">
      <Banner>Upcoming Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {isLoading ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <>
              {hasUpcomingVotes ? (
                <UpcomingVotes />
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
};

export default UpcomingVotesPage;

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
