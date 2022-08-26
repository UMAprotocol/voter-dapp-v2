import { useContractsContext } from "hooks/contexts";
import { useCurrentRoundId, useVotePhase, useRoundEndTime } from "hooks/queries";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { VotePhaseT } from "types/global";
import { CommitPhase } from "./CommitPhase";
import { RevealPhase } from "./RevealPhase";

export function VoteTimeline() {
  const { voting } = useContractsContext();
  const { currentRoundId } = useCurrentRoundId(voting);
  const phase = useVotePhase();
  const roundEndsMilliseconds = useRoundEndTime(currentRoundId);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<number>();
  const phaseRef = useRef<VotePhaseT>();

  useEffect(() => {
    if (!phase || !roundEndsMilliseconds) return;

    if (!phaseRef.current) {
      phaseRef.current = phase;
    }

    if (!timerRef.current) {
      timerRef.current = makeTimer();
      window.addEventListener("focus", () => makeTimer(true));
      return;
    }

    if (phase !== phaseRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = makeTimer(true);
      return;
    }

    function makeTimer(isRefresh = false) {
      if (!roundEndsMilliseconds) return;
      const timer = window.setInterval(() => {
        setTimeRemaining((timeRemaining) => {
          if (!timeRemaining || isRefresh) {
            return getPhaseEnds(phase, roundEndsMilliseconds) - Date.now();
          }
          return timeRemaining - 1000;
        });
      }, 1000);
      return timer;
    }

    return () => {
      window.removeEventListener("focus", () => makeTimer(true));
      clearInterval(timerRef.current);
    };
  }, [phase, roundEndsMilliseconds]);

  function getPhaseEnds(phase: VotePhaseT, roundEndsMilliseconds: number) {
    switch (phase) {
      case "commit":
        return roundEndsMilliseconds - 10 * 60 * 1000;
      case "reveal":
        return roundEndsMilliseconds;
      default:
        return 0;
    }
  }

  if (!phase) return null;

  return (
    <Wrapper>
      <CommitPhase phase={phase} timeRemaining={timeRemaining} />
      <RevealPhase phase={phase} timeRemaining={timeRemaining} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
