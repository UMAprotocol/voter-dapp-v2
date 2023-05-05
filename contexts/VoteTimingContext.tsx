import {
  computeMillisecondsUntilPhaseEnds,
  computePhaseEndTimeMilliseconds,
  computeRoundId,
  getPhase,
} from "helpers";
import { ReactNode, createContext, useMemo, useState } from "react";

export interface VoteTimingContextState {
  isCommit: boolean;
  isReveal: boolean;
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
  isCommit: false,
  isReveal: false,
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

export const VoteTimingContext = createContext<VoteTimingContextState>(
  defaultVoteTimingContextState
);

export function VoteTimingProvider({ children }: { children: ReactNode }) {
  const [roundId, setRoundId] = useState(defaultVoteTimingContextState.roundId);
  const [phase, setPhase] = useState(defaultVoteTimingContextState.phase);
  const [phaseEndTimeMilliseconds, setPhaseEndTimeMilliseconds] = useState(
    defaultVoteTimingContextState.phaseEndTimeMilliseconds
  );
  const [phaseEndTimeAsDate, setPhaseEndTimeAsDate] = useState(
    defaultVoteTimingContextState.phaseEndTimeAsDate
  );
  const [millisecondsUntilPhaseEnds, setMillisecondsUntilPhaseEnds] = useState(
    defaultVoteTimingContextState.millisecondsUntilPhaseEnds
  );
  const isCommit = phase === "commit";
  const isReveal = phase === "reveal";

  const value = useMemo(
    () => ({
      isCommit,
      isReveal,
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
    }),
    [
      isCommit,
      isReveal,
      millisecondsUntilPhaseEnds,
      phase,
      phaseEndTimeAsDate,
      phaseEndTimeMilliseconds,
      roundId,
    ]
  );

  return (
    <VoteTimingContext.Provider value={value}>
      {children}
    </VoteTimingContext.Provider>
  );
}
