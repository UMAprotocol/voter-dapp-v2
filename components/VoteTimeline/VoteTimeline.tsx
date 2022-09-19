import { phaseLengthMilliseconds } from "constants/voteTiming";
import { useVotesContext } from "hooks/contexts";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
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

    // if we are in an active vote, the next phase begins when the current one ends
    if (getActivityStatus() === "active") {
      commitTimeRemaining = millisecondsUntilPhaseEnds;
      revealTimeRemaining = millisecondsUntilPhaseEnds;
      // this component is hidden when there are no active or upcoming votes
      // so we can assume that if there are no active votes, there are upcoming votes
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
      <CommitPhase phase={phase} timeRemaining={commitTimeRemaining} isUpcoming={getActivityStatus() === "upcoming"} />
      <RevealPhase phase={phase} timeRemaining={revealTimeRemaining} isUpcoming={getActivityStatus() === "upcoming"} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
