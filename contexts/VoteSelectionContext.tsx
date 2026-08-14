import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { pruneSelectedVotes } from "helpers";
import { usePersistedVotes } from "hooks/helpers/usePersistedVotes";
import { SelectedVotesByKeyT, VoteT } from "types";
import { VotesContext } from "./VotesContext";
import { VoteTimingContext } from "./VoteTimingContext";

export interface VoteSelectionContextState {
  selectedVotes: SelectedVotesByKeyT;
  selectVote: (value: string | undefined, vote: VoteT) => void;
  setSelectedVotes: Dispatch<SetStateAction<SelectedVotesByKeyT>>;
}

export const defaultVoteSelectionContextState: VoteSelectionContextState = {
  selectedVotes: {},
  selectVote: () => null,
  setSelectedVotes: () => null,
};

export const VoteSelectionContext = createContext<VoteSelectionContextState>(
  defaultVoteSelectionContextState
);

// The current round's quick-vote selections, persisted per round. One shared
// store read by the active-votes list and the vote panel alike, so the
// panel's quick-vote controls work identically however it was opened (row
// click, deeplink, history) without threading callbacks through openPanel.
export function VoteSelectionProvider({ children }: { children: ReactNode }) {
  const { roundId } = useContext(VoteTimingContext);
  const { activeVotesByKey } = useContext(VotesContext);
  const [selectedVotes, setSelectedVotes] = usePersistedVotes(roundId);

  // The persisted-votes round guard trusts the clock-derived roundId, so a
  // skewed client clock can stamp selections with the wrong round and leak
  // them into this one. Prune against the on-chain active list once it has
  // loaded (undefined means still loading — pruning then would wipe
  // legitimate persisted selections against an empty list).
  useEffect(() => {
    if (!activeVotesByKey) return;
    const activeKeys = new Set(Object.keys(activeVotesByKey));
    setSelectedVotes((selected) => pruneSelectedVotes(selected, activeKeys));
  }, [activeVotesByKey, setSelectedVotes]);

  const selectVote = useCallback(
    (value: string | undefined, vote: VoteT) => {
      setSelectedVotes((selected) => ({
        ...selected,
        [vote.uniqueKey]: value,
      }));
    },
    [setSelectedVotes]
  );

  const value = useMemo(
    () => ({ selectedVotes, selectVote, setSelectedVotes }),
    [selectedVotes, selectVote, setSelectedVotes]
  );

  return (
    <VoteSelectionContext.Provider value={value}>
      {children}
    </VoteSelectionContext.Provider>
  );
}
