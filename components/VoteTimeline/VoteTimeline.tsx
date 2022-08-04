import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import { VoteTimelineT } from "types/global";

export function VoteTimeline({ phase, phaseEnds }: VoteTimelineT) {
  let commitPhaseStartsIn = null,
    revealPhaseStartsIn = null,
    commitPhaseTimeRemaining = null,
    revealPhaseTimeRemaining = null;

  if (phase === "commit") {
    commitPhaseTimeRemaining = formatDistanceToNowStrict(phaseEnds);
    revealPhaseStartsIn = formatDistanceToNowStrict(phaseEnds);
  }

  if (phase === "reveal") {
    revealPhaseTimeRemaining = formatDistanceToNowStrict(phaseEnds);
  }

  return (
    <Wrapper>
      <CommitPhase phase={phase} startsIn={commitPhaseStartsIn} timeRemaining={commitPhaseTimeRemaining} />
      <RevealPhase phase={phase} startsIn={revealPhaseStartsIn} timeRemaining={revealPhaseTimeRemaining} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
