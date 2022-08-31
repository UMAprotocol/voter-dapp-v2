import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";

export function VoteTimeline() {
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();

  if (!phase || !millisecondsUntilPhaseEnds) return null;

  return (
    <Wrapper>
      <CommitPhase phase={phase} timeRemaining={millisecondsUntilPhaseEnds} />
      <RevealPhase phase={phase} timeRemaining={millisecondsUntilPhaseEnds} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
