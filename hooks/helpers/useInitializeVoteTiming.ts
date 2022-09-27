import {
  computeMillisecondsUntilPhaseEnds,
  computePhaseEndTimeMilliseconds,
  computeRoundId,
  getPhase,
} from "helpers/voteTiming";
import { useInterval, useVoteTimingContext } from "hooks";

/** Initializes the vote timing interval
 *
 * The interval runs once per second, and re-computes the round ID, phase, and time until phase ends based on the current time.
 *
 * This hook only needs to be called once on initialization of the dapp.
 */
export default function useInitializeVoteTiming() {
  const { setRoundId, setPhase, setPhaseEndTimeMilliseconds, setPhaseEndTimeAsDate, setMillisecondsUntilPhaseEnds } =
    useVoteTimingContext();

  useInterval(() => {
    setRoundId(computeRoundId());
    setMillisecondsUntilPhaseEnds(computeMillisecondsUntilPhaseEnds());
    setPhase(getPhase());
    setPhaseEndTimeMilliseconds(computePhaseEndTimeMilliseconds());
    setPhaseEndTimeAsDate(new Date(computePhaseEndTimeMilliseconds()));
  }, 1000);
}
