import { Button, LoadingSpinner, VoteTimeline } from "components";
import { LoadingSpinnerWrapper } from "components/pages/styles";
import { tabletAndUnder } from "constant";
import { useVotesContext } from "hooks";
import Image from "next/image";
import noVotesIndicator from "public/assets/no-votes-indicator.png";
import styled from "styled-components";
import { ActiveVotes } from "./ActiveVotes";

// Upcoming and past votes have their own pages, so this page only shows the
// votes a voter can act on now.
export function Votes() {
  const { activeVoteList, activeVotesIsLoading } = useVotesContext();

  if (activeVoteList.length > 0) return <ActiveVotes />;

  if (activeVotesIsLoading) {
    return (
      <LoadingSpinnerWrapper>
        <LoadingSpinner size={40} variant="black" />
        <LoadingText>Loading votes...</LoadingText>
      </LoadingSpinnerWrapper>
    );
  }

  return (
    <>
      <VoteTimeline />
      <NoVotesWrapper>
        <NoVotesText>
          <NoVotesMessage>No votes this round</NoVotesMessage>
          <NoVotesDetail>
            There is nothing to vote on. Your stake keeps earning&nbsp;rewards.
          </NoVotesDetail>
        </NoVotesText>
        <Image src={noVotesIndicator} width={220} height={220} alt="No votes" />
        <Links>
          <Button
            variant="primary"
            label="Upcoming votes"
            href="/upcoming-votes"
          />
          <Button variant="secondary" label="Past votes" href="/past-votes" />
        </Links>
      </NoVotesWrapper>
    </>
  );
}

const LoadingText = styled.div`
  margin-top: 20px;
  font: var(--text-md);
  color: var(--grey-800);
  text-align: center;
`;

const NoVotesWrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 40px;
  margin-top: 45px;
`;

const NoVotesText = styled.div`
  display: grid;
  gap: 10px;
  text-align: center;
`;

const NoVotesMessage = styled.h1`
  font: var(--header-lg);
  font-weight: 300;
`;

const NoVotesDetail = styled.p`
  font: var(--text-md);
  color: var(--grey-800);
  text-wrap: balance;
`;

const Links = styled.div`
  display: flex;
  gap: 15px;

  @media ${tabletAndUnder} {
    flex-direction: column;
  }
`;
