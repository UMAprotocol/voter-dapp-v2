import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import { VoteTimelineT } from "types/global";

export function VoteTimeline({
  phase,
  commitPhaseStart,
  revealPhaseStart,
  commitPhaseEnd,
  revealPhaseEnd,
}: VoteTimelineT) {
  const commitPhaseStartsIn = commitPhaseStart && formatDistanceToNowStrict(commitPhaseStart);
  const revealPhaseStartsIn = revealPhaseStart && formatDistanceToNowStrict(revealPhaseStart);
  const commitPhaseTimeRemaining = commitPhaseEnd && formatDistanceToNowStrict(commitPhaseEnd);
  const revealPhaseTimeRemaining = revealPhaseEnd && formatDistanceToNowStrict(revealPhaseEnd);

  return (
    <Wrapper>
      <CommitPhase phase={phase} startsIn={commitPhaseStartsIn} timeRemaining={commitPhaseTimeRemaining} />
      <RevealPhase phase={phase} startsIn={revealPhaseStartsIn} timeRemaining={revealPhaseTimeRemaining} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
