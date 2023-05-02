import {
  Banner,
  Layout,
  PageInnerWrapper,
  PageOuterWrapper,
  UpcomingVotes,
} from "components";
import type { NextPage } from "next";
import styled from "styled-components";
import Image from "next/image";
import noVotesIndicator from "public/assets/no-votes-indicator.png";

const UpcomingVotesPage: NextPage = () => {
  return (
    <Layout title="UMA | Upcoming Votes">
      <Banner>Upcoming Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          <UpcomingVotes />
          <NoVotesWrapper>
            <NoVotesMessage>No upcoming votes</NoVotesMessage>
            <Image
              src={noVotesIndicator}
              width={220}
              height={220}
              alt="No votes"
            />
          </NoVotesWrapper>
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
