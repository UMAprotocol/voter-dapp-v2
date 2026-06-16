import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "uma-voter-auto-advance";

function loadFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Opt-in "auto-advance after voting" preference, persisted in localStorage.
 *
 * The stored value is read in an effect (not in the initial useState) so the
 * server render and the first client render agree on `false`, avoiding a
 * hydration mismatch. Mirrors the load-once-then-persist shape of
 * usePersistedVotes.
 */
export function useAutoAdvance(): [boolean, () => void] {
  const [enabled, setEnabled] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      setEnabled(loadFromStorage());
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    } catch {
      // Ignore write failures (private mode / storage disabled): the toggle
      // still works for the current session, it just won't persist.
    }
  }, [enabled, hasLoaded]);

  const toggle = useCallback(() => setEnabled((prev) => !prev), []);

  return [enabled, toggle];
}
