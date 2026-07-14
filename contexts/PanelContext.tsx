import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { PanelTypeT, VoteT } from "types";

export function scrollToAndHighlightVote(uniqueKey: string, attempt = 0) {
  const el = document.querySelector(`[data-vote-key="${uniqueKey}"]`);
  if (!el) {
    // deeplinked rows may still be mounting (list render, pagination jump)
    if (attempt < 10) {
      setTimeout(() => scrollToAndHighlightVote(uniqueKey, attempt + 1), 200);
    }
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("vote-highlight");
  void (el as HTMLElement).offsetWidth;
  el.classList.add("vote-highlight");
  setTimeout(() => el.classList.remove("vote-highlight"), 1500);
}

export type OpenPanelOptions = {
  navigableVotes?: VoteT[];
};

export type VoteOpener = (vote: VoteT, navigableVotes: VoteT[]) => void;

export interface PanelContextState {
  panelType: PanelTypeT;
  panelContent: VoteT | undefined;
  panelOpen: boolean;
  openPanel: (
    panelType: PanelTypeT,
    panelContent?: VoteT,
    options?: OpenPanelOptions
  ) => void;
  closePanel: (clearPreviousPanelData?: boolean) => void;
  openVote: VoteOpener;
  navigableVotes: VoteT[];
  currentVoteIndex: number;
  goToNextVote: () => void;
  goToPrevVote: () => void;
}

export const defaultPanelContextState: PanelContextState = {
  panelType: "menu" as const,
  panelContent: undefined,
  panelOpen: false,
  openPanel: () => null,
  closePanel: () => null,
  openVote: () => null,
  navigableVotes: [],
  currentVoteIndex: -1,
  goToNextVote: () => null,
  goToPrevVote: () => null,
};

export const PanelContext = createContext<PanelContextState>(
  defaultPanelContextState
);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panelType, setPanelType] = useState<PanelTypeT>("menu");
  const [panelContent, setPanelContent] = useState<VoteT | undefined>();
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [previousPanelData, setPreviousPanelData] = useState<
    { panelType: PanelTypeT; panelContent: VoteT | undefined }[]
  >([]);
  const [navigableVotes, setNavigableVotes] = useState<VoteT[]>([]);
  const [currentVoteIndex, setCurrentVoteIndex] = useState(-1);

  const openPanel = useCallback(
    (
      panelType: PanelTypeT,
      panelContent?: VoteT,
      options?: OpenPanelOptions
    ) => {
      setPanelType(panelType);
      setPanelContent(panelContent);
      setPanelOpen(true);
      pushPanelDataOntoStack(panelType, panelContent);

      if (options?.navigableVotes) {
        setNavigableVotes(options.navigableVotes);
        const index = options.navigableVotes.findIndex(
          (v) => v.uniqueKey === panelContent?.uniqueKey
        );
        setCurrentVoteIndex(index >= 0 ? index : 0);
      } else {
        setNavigableVotes([]);
        setCurrentVoteIndex(-1);
      }
    },
    []
  );

  const openVote = useCallback<VoteOpener>(
    (vote, navigableVotes) => {
      openPanel("vote", vote, { navigableVotes });
    },
    [openPanel]
  );

  const goToNextVote = useCallback(() => {
    if (currentVoteIndex < navigableVotes.length - 1) {
      const nextIndex = currentVoteIndex + 1;
      setCurrentVoteIndex(nextIndex);
      setPanelContent(navigableVotes[nextIndex]);
      scrollToAndHighlightVote(navigableVotes[nextIndex].uniqueKey);
    }
  }, [currentVoteIndex, navigableVotes]);

  const goToPrevVote = useCallback(() => {
    if (currentVoteIndex > 0) {
      const prevIndex = currentVoteIndex - 1;
      setCurrentVoteIndex(prevIndex);
      setPanelContent(navigableVotes[prevIndex]);
      scrollToAndHighlightVote(navigableVotes[prevIndex].uniqueKey);
    }
  }, [currentVoteIndex, navigableVotes]);

  const closePanel = useCallback(
    (clearPreviousPanelData = false) => {
      if (clearPreviousPanelData) {
        setPreviousPanelData([]);
        setPanelOpen(false);
        return;
      }
      if (previousPanelData.length > 1) {
        const previousPanel = previousPanelData[previousPanelData.length - 2];
        setPanelType(previousPanel.panelType);
        setPanelContent(previousPanel.panelContent);
        popPanelDataOffStack();
      } else {
        popPanelDataOffStack();
        setPanelOpen(false);
      }
    },
    [previousPanelData]
  );

  function pushPanelDataOntoStack(panelType: PanelTypeT, panelContent?: VoteT) {
    setPreviousPanelData((prev) => {
      return [...prev, { panelType, panelContent }];
    });
  }

  function popPanelDataOffStack() {
    setPreviousPanelData((prev) => {
      return prev.slice(0, prev.length - 1);
    });
  }

  const value = useMemo(
    () => ({
      panelType,
      panelContent,
      panelOpen,
      openPanel,
      closePanel,
      openVote,
      navigableVotes,
      currentVoteIndex,
      goToNextVote,
      goToPrevVote,
    }),
    [
      closePanel,
      openPanel,
      openVote,
      panelContent,
      panelOpen,
      panelType,
      navigableVotes,
      currentVoteIndex,
      goToNextVote,
      goToPrevVote,
    ]
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}
