import { LoadingSpinner } from "components";
import { LoadingSpinnerWrapper } from "components/pages/styles";
import { useVotesContext } from "hooks";
import styled from "styled-components";
import { ActiveVotes } from "./ActiveVotes";
import { PastVotes } from "./PastVotes";
import { UpcomingVotes } from "./UpcomingVotes";

export function Votes() {
  const {
    activeVoteList,
    pastVoteList,
    upcomingVoteList,
    activeVotesIsLoading,
    pastVotesIsLoading,
    upcomingVotesIsLoading,
  } = useVotesContext();

  const hasActiveVotes = activeVoteList.length > 0;
  const hasUpcomingVotes = upcomingVoteList.length > 0;
  const hasPastVotes = pastVoteList.length > 0;
  const hasAnyVotes = hasActiveVotes || hasUpcomingVotes || hasPastVotes;
  const isLoading =
    activeVotesIsLoading || pastVotesIsLoading || upcomingVotesIsLoading;

  return (
    <>
      {hasActiveVotes && <ActiveVotes />}
      {hasUpcomingVotes && <UpcomingVotes />}
      {hasPastVotes && <PastVotes />}
      {!hasAnyVotes && (
        <LoadingSpinnerWrapper>
          <LoadingSpinner size={40} variant="black" />
          {isLoading && <LoadingText>Loading votes...</LoadingText>}
        </LoadingSpinnerWrapper>
      )}
    </>
  );
}

const LoadingText = styled.div`
  margin-top: 20px;
  font: var(--text-md);
  color: var(--grey-800);
  text-align: center;
`;
