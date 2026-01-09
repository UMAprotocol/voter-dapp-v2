import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { SelectedVotesByKeyT } from "types";

const STORAGE_KEY = "uma-voter-selected-votes";

type StoredVotesData = {
  roundId: number;
  votes: SelectedVotesByKeyT;
};

function loadFromStorage(currentRoundId: number): SelectedVotesByKeyT {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const data = JSON.parse(stored) as StoredVotesData;
    if (data.roundId !== currentRoundId) return {};
    return data.votes;
  } catch {
    return {};
  }
}

export function usePersistedVotes(
  roundId: number
): [SelectedVotesByKeyT, Dispatch<SetStateAction<SelectedVotesByKeyT>>] {
  const [votes, setVotes] = useState<SelectedVotesByKeyT>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (roundId && !hasLoaded) {
      setVotes(loadFromStorage(roundId));
      setHasLoaded(true);
    }
  }, [roundId, hasLoaded]);

  useEffect(() => {
    if (roundId && hasLoaded) {
      const data: StoredVotesData = { roundId, votes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [votes, roundId, hasLoaded]);

  return [votes, setVotes];
}
