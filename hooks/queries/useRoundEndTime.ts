import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import useVotePhase from "./useVotePhase";

export default function useRoundEndTime(roundId: BigNumber | undefined) {
  const votePhase = useVotePhase();
  const [roundEndTimeMilliseconds, setRoundEndTimeMilliseconds] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!roundId) return;
    const phaseLengthUnix = 10 * 60;
    const numPhases = 2;

    const roundLength = phaseLengthUnix * numPhases;
    const roundEndTime = roundLength * (roundId.toNumber() + 1);
    const roundEndTimeMilliseconds = roundEndTime * 1000;
    setRoundEndTimeMilliseconds(roundEndTimeMilliseconds);
  }, [roundId, votePhase]);

  return roundEndTimeMilliseconds;
}
