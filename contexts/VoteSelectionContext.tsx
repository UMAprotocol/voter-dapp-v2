import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { usePersistedVotes } from "hooks/helpers/usePersistedVotes";
import { SelectedVotesByKeyT, VoteT } from "types";
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
  const [selectedVotes, setSelectedVotes] = usePersistedVotes(roundId);

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
