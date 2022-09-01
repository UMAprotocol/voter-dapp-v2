import { useVotesContext } from "hooks/contexts";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";

export function VoteTimeline() {
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const { hasActiveVotes } = useVotesContext();

  if (!phase || !millisecondsUntilPhaseEnds) return null;

  return (
    <Wrapper>
      <CommitPhase phase={phase} timeRemaining={millisecondsUntilPhaseEnds} isUpcoming={!hasActiveVotes} />
      <RevealPhase phase={phase} timeRemaining={millisecondsUntilPhaseEnds} isUpcoming={!hasActiveVotes} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
