import {
  computeMillisecondsUntilPhaseEnds,
  computePhaseEndTimeMilliseconds,
  computeRoundId,
  getPhase,
} from "helpers/voteTiming";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import { useInterval } from "hooks/helpers";

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
    setMillisecondsUntilPhaseEnds(computeMillisecondsUntilPhaseEnds());
    setRoundId(computeRoundId());
    setPhase(getPhase());
    setPhaseEndTimeMilliseconds(computePhaseEndTimeMilliseconds());
    setPhaseEndTimeAsDate(new Date(computePhaseEndTimeMilliseconds()));
  }, 1000);
}
