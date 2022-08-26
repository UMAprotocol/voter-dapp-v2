import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import useVotePhase from "./useVotePhase";

export default function useVotePhaseEnds(roundId: BigNumber | undefined) {
  const votePhase = useVotePhase();
  const [phaseEndsMilliseconds, setPhaseEndsMilliseconds] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!roundId) return;
    const phaseLengthUnix = 10 * 60;
    const numPhases = 2;

    const roundLength = phaseLengthUnix * numPhases;
    const roundEndTime = roundLength * (roundId.toNumber() + 1);
    const roundEndTimeMilliseconds = roundEndTime * 1000;
    setPhaseEndsMilliseconds(roundEndTimeMilliseconds);
  }, [roundId, votePhase]);

  return phaseEndsMilliseconds;
}
