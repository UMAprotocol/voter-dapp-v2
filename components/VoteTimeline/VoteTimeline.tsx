import { tabletAndUnder } from "constant";
import { useVotesContext, useVoteTimingContext } from "hooks";
import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";

export function VoteTimeline() {
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const { isActive } = useVotesContext();

  if (isActive) return null;

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
  isolation: isolate;

  @media ${tabletAndUnder} {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
`;
