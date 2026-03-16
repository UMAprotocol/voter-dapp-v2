import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { PanelTypeT, SelectedVotesByKeyT, VoteT } from "types";

export type OpenPanelOptions = {
  navigableVotes?: VoteT[];
  selectedVotes?: SelectedVotesByKeyT;
  selectVote?: (value: string | undefined, vote: VoteT) => void;
};

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
  navigableVotes: VoteT[];
  currentVoteIndex: number;
  goToNextVote: () => void;
  goToPrevVote: () => void;
  selectVote: ((value: string | undefined, vote: VoteT) => void) | undefined;
  selectedVotes: SelectedVotesByKeyT;
}

export const defaultPanelContextState: PanelContextState = {
  panelType: "menu" as const,
  panelContent: undefined,
  panelOpen: false,
  openPanel: () => null,
  closePanel: () => null,
  navigableVotes: [],
  currentVoteIndex: -1,
  goToNextVote: () => null,
  goToPrevVote: () => null,
  selectVote: undefined,
  selectedVotes: {},
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
  const [selectVoteFn, setSelectVoteFn] = useState<
    ((value: string | undefined, vote: VoteT) => void) | undefined
  >();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});

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

      if (options?.selectVote) {
        setSelectVoteFn(() => options.selectVote);
      } else {
        setSelectVoteFn(undefined);
      }

      setSelectedVotes(options?.selectedVotes ?? {});
    },
    []
  );

  const wrappedSelectVote = useCallback(
    (value: string | undefined, vote: VoteT) => {
      selectVoteFn?.(value, vote);
      setSelectedVotes((prev) => ({ ...prev, [vote.uniqueKey]: value }));
    },
    [selectVoteFn]
  );

  const goToNextVote = useCallback(() => {
    if (currentVoteIndex < navigableVotes.length - 1) {
      const nextIndex = currentVoteIndex + 1;
      setCurrentVoteIndex(nextIndex);
      setPanelContent(navigableVotes[nextIndex]);
    }
  }, [currentVoteIndex, navigableVotes]);

  const goToPrevVote = useCallback(() => {
    if (currentVoteIndex > 0) {
      const prevIndex = currentVoteIndex - 1;
      setCurrentVoteIndex(prevIndex);
      setPanelContent(navigableVotes[prevIndex]);
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
      navigableVotes,
      currentVoteIndex,
      goToNextVote,
      goToPrevVote,
      selectVote: selectVoteFn ? wrappedSelectVote : undefined,
      selectedVotes,
    }),
    [
      closePanel,
      openPanel,
      panelContent,
      panelOpen,
      panelType,
      navigableVotes,
      currentVoteIndex,
      goToNextVote,
      goToPrevVote,
      selectVoteFn,
      wrappedSelectVote,
      selectedVotes,
    ]
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}
