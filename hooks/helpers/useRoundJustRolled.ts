import { oneMinute, phaseLengthMilliseconds } from "constant";
import { useVoteTimingContext } from "hooks";

// the subgraph can lag the chain right after a round resolves, so the first
// fetch of a new round may miss the just-resolved requests or their reveals.
// Queries whose results become permanent once indexed poll during this
// window, then rest.
export function useRoundJustRolled(windowMilliseconds = 15 * oneMinute) {
  const { phase, millisecondsUntilPhaseEnds } = useVoteTimingContext();
  return (
    phase === "commit" &&
    phaseLengthMilliseconds - millisecondsUntilPhaseEnds < windowMilliseconds
  );
}
