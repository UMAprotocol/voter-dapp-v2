import { useEffect, useState } from "react";
import { VotePhaseT } from "types/global";

export default function useVotePhase() {
  const [votePhase, setVotePhase] = useState<VotePhaseT | null>(null);

  useEffect(() => {
    const phaseLength = 10 * 60;
    const numPhases = 2;

    const interval = setInterval(() => {
      const currentTimeUnix = Date.now() / 1000;
      const phase = Math.floor((currentTimeUnix / phaseLength) % numPhases);

      if (phase === 0) {
        setVotePhase("commit");
      }
      if (phase === 1) {
        setVotePhase("reveal");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return votePhase;
}
