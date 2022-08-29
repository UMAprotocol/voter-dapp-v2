import {
  computeMillisecondsUntilPhaseEnds,
  computePhaseEndTimeMilliseconds,
  computeRoundId,
  getPhase,
} from "helpers/voteTiming";
import { createContext, ReactNode, useState } from "react";

interface VoteTimingContextState {
  roundId: number;
  setRoundId: (roundId: number) => void;
  phase: "commit" | "reveal";
  setPhase: (phase: "commit" | "reveal") => void;
  phaseEndTimeMilliseconds: number;
  setPhaseEndTimeMilliseconds: (phaseEndTimeMilliseconds: number) => void;
  phaseEndTimeAsDate: Date;
  setPhaseEndTimeAsDate: (phaseEndTimeAsDate: Date) => void;
  millisecondsUntilPhaseEnds: number;
  setMillisecondsUntilPhaseEnds: (millisecondsUntilPhaseEnds: number) => void;
}

export const defaultVoteTimingContextState: VoteTimingContextState = {
  roundId: computeRoundId(),
  setRoundId: () => null,
  phase: getPhase(),
  setPhase: () => null,
  phaseEndTimeMilliseconds: computePhaseEndTimeMilliseconds(),
  setPhaseEndTimeMilliseconds: () => null,
  phaseEndTimeAsDate: new Date(computePhaseEndTimeMilliseconds()),
  setPhaseEndTimeAsDate: () => null,
  millisecondsUntilPhaseEnds: computeMillisecondsUntilPhaseEnds(),
  setMillisecondsUntilPhaseEnds: () => null,
};

export const VoteTimingContext = createContext<VoteTimingContextState>(defaultVoteTimingContextState);

export function VoteTimingProvider({ children }: { children: ReactNode }) {
  const [roundId, setRoundId] = useState(defaultVoteTimingContextState.roundId);
  const [phase, setPhase] = useState(defaultVoteTimingContextState.phase);
  const [phaseEndTimeMilliseconds, setPhaseEndTimeMilliseconds] = useState(
    defaultVoteTimingContextState.phaseEndTimeMilliseconds
  );
  const [phaseEndTimeAsDate, setPhaseEndTimeAsDate] = useState(defaultVoteTimingContextState.phaseEndTimeAsDate);
  const [millisecondsUntilPhaseEnds, setMillisecondsUntilPhaseEnds] = useState(
    defaultVoteTimingContextState.millisecondsUntilPhaseEnds
  );

  return (
    <VoteTimingContext.Provider
      value={{
        roundId,
        setRoundId,
        phase,
        setPhase,
        phaseEndTimeMilliseconds,
        setPhaseEndTimeMilliseconds,
        phaseEndTimeAsDate,
        setPhaseEndTimeAsDate,
        millisecondsUntilPhaseEnds,
        setMillisecondsUntilPhaseEnds,
      }}
    >
      {children}
    </VoteTimingContext.Provider>
  );
}
