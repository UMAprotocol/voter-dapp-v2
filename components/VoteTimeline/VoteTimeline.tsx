import styled from "styled-components";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";
import { VoteTimelineT } from "types/global";
import useCurrentRoundId from "hooks/queries/useCurrentRoundId";
import useVotePhaseEnds from "hooks/queries/useVotePhaseEnds";
import { useContractsContext } from "hooks/contexts";
import { useEffect, useState } from "react";
import { formatDuration, intervalToDuration } from "date-fns";

export function VoteTimeline({ phase }: VoteTimelineT) {
  const { voting } = useContractsContext();
  const { currentRoundId } = useCurrentRoundId(voting);
  const phaseEndsMilliseconds = useVotePhaseEnds(currentRoundId);
  const [commitPhaseStartsIn, setCommitPhaseStartsIn] = useState("");
  const [revealPhaseStartsIn, setRevealPhaseStartsIn] = useState("");
  const [commitPhaseTimeRemaining, setCommitPhaseTimeRemaining] = useState("");
  const [revealPhaseTimeRemaining, setRevealPhaseTimeRemaining] = useState("");

  useEffect(() => {
    if (!phaseEndsMilliseconds) return;

    const interval = setInterval(() => {
      const start = new Date();
      const end = new Date(phaseEndsMilliseconds);
      if (start > end) {
        return;
      }
      const duration = intervalToDuration({ start, end });

      const { hours, minutes, seconds } = duration;
      const formattedDuration = formatDuration({ hours, minutes, seconds });

      if (phase === "commit" && phaseEndsMilliseconds) {
        setCommitPhaseTimeRemaining(formattedDuration);
        setRevealPhaseStartsIn(formattedDuration);
      }

      if (phase === "reveal" && phaseEndsMilliseconds) {
        setRevealPhaseTimeRemaining(formattedDuration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, phaseEndsMilliseconds]);

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
