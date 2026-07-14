import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
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
  const loadedRoundRef = useRef<number>();

  // (Re)load whenever the round changes, not just on mount: the hook lives in
  // an app-lifetime provider, so a round can roll over while it is mounted.
  // Reloading drops the previous round's selections (via the roundId check in
  // loadFromStorage) instead of carrying them into — and persisting them
  // under — the new round, where a rolled vote shares its uniqueKey. One
  // effect, so a round change can never persist state belonging to the
  // previous round before the reload lands.
  useEffect(() => {
    if (!roundId) return;
    if (loadedRoundRef.current !== roundId) {
      loadedRoundRef.current = roundId;
      setVotes(loadFromStorage(roundId));
      return;
    }
    const data: StoredVotesData = { roundId, votes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [votes, roundId]);

  return [votes, setVotes];
}
