import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityStatusT, PanelTypeT, VotePhaseT, VoteT } from "types";

interface OpenPanelOptions {
  votes?: VoteT[];
  currentIndex?: number;
  getCallbacks?: (vote: VoteT) => {
    selectVote: (value: string | undefined) => void;
    clearVote: () => void;
  };
  getSelectedVote?: (vote: VoteT) => string | undefined;
  selectedVote?: string | undefined;
  phase?: VotePhaseT;
  activityStatus?: ActivityStatusT;
}

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
  votes: VoteT[];
  currentIndex: number;
  nextVote: () => void;
  prevVote: () => void;
  selectVote: ((value: string | undefined) => void) | undefined;
  clearVote: (() => void) | undefined;
  selectedVote: string | undefined;
  phase: VotePhaseT | undefined;
  activityStatus: ActivityStatusT | undefined;
}

export const defaultPanelContextState: PanelContextState = {
  panelType: "menu",
  panelContent: undefined,
  panelOpen: false,
  openPanel: () => null,
  closePanel: () => null,
  votes: [],
  currentIndex: 0,
  nextVote: () => null,
  prevVote: () => null,
  selectVote: undefined,
  clearVote: undefined,
  selectedVote: undefined,
  phase: undefined,
  activityStatus: undefined,
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

  // Vote navigation state (drives arrow button UI)
  const [votes, setVotes] = useState<VoteT[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Vote UI state for VoteButtonRow
  const [selectedVote, setSelectedVote] = useState<string | undefined>();
  const [phase, setPhase] = useState<VotePhaseT | undefined>();
  const [activityStatus, setActivityStatus] = useState<
    ActivityStatusT | undefined
  >();

  // Refs for callback factories — not UI state, no re-render needed
  const rawSelectVoteRef = useRef<
    ((value: string | undefined) => void) | undefined
  >(undefined);
  const rawClearVoteRef = useRef<(() => void) | undefined>(undefined);
  const getCallbacksFactoryRef = useRef<
    | ((vote: VoteT) => {
        selectVote: (value: string | undefined) => void;
        clearVote: () => void;
      })
    | undefined
  >(undefined);
  const getSelectedVoteFactoryRef = useRef<
    ((vote: VoteT) => string | undefined) | undefined
  >(undefined);

  // Wrapped selectVote/clearVote — stable, read from refs
  const selectVote = useCallback((value: string | undefined) => {
    rawSelectVoteRef.current?.(value);
    setSelectedVote(value);
  }, []);

  const clearVote = useCallback(() => {
    rawClearVoteRef.current?.();
    setSelectedVote(undefined);
  }, []);

  const openPanel = useCallback(
    (
      panelType: PanelTypeT,
      panelContent?: VoteT,
      options?: OpenPanelOptions
    ) => {
      setPanelType(panelType);
      setPanelContent(panelContent);
      setPanelOpen(true);

      if (panelType === "vote") {
        // Replace stack with single entry — prevents unbounded growth from repeated row clicks
        setPreviousPanelData([{ panelType, panelContent }]);

        const newVotes = options?.votes ?? [];
        const newIndex = options?.currentIndex ?? 0;
        setVotes(newVotes);
        setCurrentIndex(newIndex);
        setSelectedVote(options?.selectedVote);
        setPhase(options?.phase);
        setActivityStatus(options?.activityStatus);

        // Store factory refs for arrow navigation
        getCallbacksFactoryRef.current = options?.getCallbacks;
        getSelectedVoteFactoryRef.current = options?.getSelectedVote;

        // Derive initial callbacks from current panel content
        if (options?.getCallbacks && panelContent) {
          const cbs = options.getCallbacks(panelContent);
          rawSelectVoteRef.current = cbs.selectVote;
          rawClearVoteRef.current = cbs.clearVote;
        } else {
          rawSelectVoteRef.current = undefined;
          rawClearVoteRef.current = undefined;
        }
      } else {
        pushPanelDataOntoStack(panelType, panelContent);
        // Clear vote navigation state for non-vote panels
        setVotes([]);
        setCurrentIndex(0);
        setSelectedVote(undefined);
        setPhase(undefined);
        setActivityStatus(undefined);
        getCallbacksFactoryRef.current = undefined;
        getSelectedVoteFactoryRef.current = undefined;
        rawSelectVoteRef.current = undefined;
        rawClearVoteRef.current = undefined;
      }
    },
    []
  );

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

  const nextVote = useCallback(() => {
    const newIndex = currentIndex + 1;
    if (newIndex >= votes.length) return;

    const newVote = votes[newIndex];
    setPanelContent(newVote);
    setPreviousPanelData([{ panelType: "vote", panelContent: newVote }]);
    setCurrentIndex(newIndex);

    if (getCallbacksFactoryRef.current) {
      const cbs = getCallbacksFactoryRef.current(newVote);
      rawSelectVoteRef.current = cbs.selectVote;
      rawClearVoteRef.current = cbs.clearVote;
    }

    setSelectedVote(
      getSelectedVoteFactoryRef.current
        ? getSelectedVoteFactoryRef.current(newVote)
        : undefined
    );
  }, [currentIndex, votes]);

  const prevVote = useCallback(() => {
    const newIndex = currentIndex - 1;
    if (newIndex < 0) return;

    const newVote = votes[newIndex];
    setPanelContent(newVote);
    setPreviousPanelData([{ panelType: "vote", panelContent: newVote }]);
    setCurrentIndex(newIndex);

    if (getCallbacksFactoryRef.current) {
      const cbs = getCallbacksFactoryRef.current(newVote);
      rawSelectVoteRef.current = cbs.selectVote;
      rawClearVoteRef.current = cbs.clearVote;
    }

    setSelectedVote(
      getSelectedVoteFactoryRef.current
        ? getSelectedVoteFactoryRef.current(newVote)
        : undefined
    );
  }, [currentIndex, votes]);

  function pushPanelDataOntoStack(
    panelType: PanelTypeT,
    panelContent?: VoteT
  ) {
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
      votes,
      currentIndex,
      nextVote,
      prevVote,
      selectVote,
      clearVote,
      selectedVote,
      phase,
      activityStatus,
    }),
    [
      closePanel,
      openPanel,
      panelContent,
      panelOpen,
      panelType,
      votes,
      currentIndex,
      nextVote,
      prevVote,
      selectVote,
      clearVote,
      selectedVote,
      phase,
      activityStatus,
    ]
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}
