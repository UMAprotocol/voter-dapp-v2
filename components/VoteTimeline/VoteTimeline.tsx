import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";

interface Props {
  phase: "commit" | "reveal" | null;
  commitPhaseStart: Date | null;
  revealPhaseStart: Date | null;
  commitPhaseEnd: Date | null;
  revealPhaseEnd: Date | null;
}
export function VoteTimeline({ phase, commitPhaseStart, revealPhaseStart, commitPhaseEnd, revealPhaseEnd }: Props) {
  const commitPhaseStartsIn = commitPhaseStart && formatDistanceToNowStrict(commitPhaseStart);
  const revealPhaseStartsIn = revealPhaseStart && formatDistanceToNowStrict(revealPhaseStart);
  const commitPhaseTimeRemaining = commitPhaseEnd && formatDistanceToNowStrict(commitPhaseEnd);
  const revealPhaseTimeRemaining = revealPhaseEnd && formatDistanceToNowStrict(revealPhaseEnd);

  return (
    <Wrapper>
      <CommitPhase
        active={phase === "commit"}
        startsIn={commitPhaseStartsIn}
        timeRemaining={commitPhaseTimeRemaining}
      />
      <RevealPhase
        active={phase === "reveal"}
        startsIn={revealPhaseStartsIn}
        timeRemaining={revealPhaseTimeRemaining}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
