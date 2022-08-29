import {
  computeMillisecondsUntilPhaseEnds,
  computePhaseEndTimeMilliseconds,
  computeRoundId,
  getPhase,
} from "helpers/voteTiming";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import { useInterval } from "hooks/helpers";

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
