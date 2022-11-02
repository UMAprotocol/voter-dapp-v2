import { phaseLengthMilliseconds } from "constant";
import { useVotesContext, useVoteTimingContext } from "hooks";
import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";

export function VoteTimeline() {
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  const { getActivityStatus } = useVotesContext();
  const { commitTimeRemaining, revealTimeRemaining } = determineTimeRemaining();

  function determineTimeRemaining() {
    let commitTimeRemaining = 0;
    let revealTimeRemaining = 0;
    const status = getActivityStatus();

    // if we are in an active or past vote, the next phase begins when the current one ends
    if (status === "active" || status === "past") {
      commitTimeRemaining = millisecondsUntilPhaseEnds;
      revealTimeRemaining = millisecondsUntilPhaseEnds;
      // if status is not active or past, we are in an upcoming vote
    } else {
      if (phase === "commit") {
        // the commit phase starts when:
        // - the current phase ends
        // - the next (reveal) phase ends
        commitTimeRemaining = millisecondsUntilPhaseEnds + phaseLengthMilliseconds;
        // the reveal phase starts when:
        // - the current phase ends
        // - the next (reveal) phase ends
        // the next next (commit) phase ends
        revealTimeRemaining = millisecondsUntilPhaseEnds + phaseLengthMilliseconds * 2;
      }
      if (phase === "reveal") {
        // the reveal phase starts when:
        // - the current (reveal) phase ends
        // - the next (commit) phase ends
        revealTimeRemaining = millisecondsUntilPhaseEnds + phaseLengthMilliseconds;
        // the commit phase starts when:
        // - the current (reveal) phase ends
        commitTimeRemaining = millisecondsUntilPhaseEnds;
      }
    }

    return { commitTimeRemaining, revealTimeRemaining };
  }

  return (
    <Wrapper>
      <CommitPhase phase={phase} timeRemaining={commitTimeRemaining} status={getActivityStatus()} />
      <RevealPhase phase={phase} timeRemaining={revealTimeRemaining} status={getActivityStatus()} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
