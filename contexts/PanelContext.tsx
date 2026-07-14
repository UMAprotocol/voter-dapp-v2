import {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { PanelTypeT, VoteT } from "types";

export type OpenPanelOptions = {
  navigableVotes?: VoteT[];
};

// A URL write our own UI initiated (row click, panel arrows). The deeplink
// handler uses it to tell in-app opens apart from inbound navigations —
// inbound ones land on the vote's page and highlight its row.
export type ExpectedVoteOpen = {
  key: string;
  scroll: boolean;
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
  showVote: (vote: VoteT, navigableVotes: VoteT[]) => void;
  navigableVotes: VoteT[];
  currentVoteIndex: number;
  expectedVoteRef: MutableRefObject<ExpectedVoteOpen | undefined>;
  voteScrollTarget: string | undefined;
  requestVoteScroll: (uniqueKey: string) => void;
  clearVoteScroll: () => void;
}

export const defaultPanelContextState: PanelContextState = {
  panelType: "menu" as const,
  panelContent: undefined,
  panelOpen: false,
  openPanel: () => null,
  closePanel: () => null,
  showVote: () => null,
  navigableVotes: [],
  currentVoteIndex: -1,
  expectedVoteRef: { current: undefined },
  voteScrollTarget: undefined,
  requestVoteScroll: () => null,
  clearVoteScroll: () => null,
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

  const expectedVoteRef = useRef<ExpectedVoteOpen | undefined>();

  // Which row should scroll into view and flash. State (not a direct DOM
  // call) so the row itself consumes it in an effect once it is actually
  // mounted — the row may still be rendering when the request is made
  // (page redirect, pagination jump).
  const [voteScrollTarget, setVoteScrollTarget] = useState<string>();
  const requestVoteScroll = useCallback((uniqueKey: string) => {
    setVoteScrollTarget(uniqueKey);
  }, []);
  const clearVoteScroll = useCallback(() => {
    setVoteScrollTarget(undefined);
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

  // Vote-to-vote transitions (panel arrows, another row clicked, back and
  // forward between votes) replace the stack top instead of pushing, so
  // closing the panel doesn't walk back through every vote viewed.
  const showVote = useCallback((vote: VoteT, votes: VoteT[]) => {
    setPanelType("vote");
    setPanelContent(vote);
    setPanelOpen(true);
    setNavigableVotes(votes);
    const index = votes.findIndex((v) => v.uniqueKey === vote.uniqueKey);
    setCurrentVoteIndex(index >= 0 ? index : 0);
    setPreviousPanelData((prev) => {
      const top = prev[prev.length - 1];
      const entry = { panelType: "vote" as const, panelContent: vote };
      if (top?.panelType === "vote") return [...prev.slice(0, -1), entry];
      return [...prev, entry];
    });
  }, []);

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
      showVote,
      navigableVotes,
      currentVoteIndex,
      expectedVoteRef,
      voteScrollTarget,
      requestVoteScroll,
      clearVoteScroll,
    }),
    [
      closePanel,
      openPanel,
      showVote,
      panelContent,
      panelOpen,
      panelType,
      navigableVotes,
      currentVoteIndex,
      voteScrollTarget,
      requestVoteScroll,
      clearVoteScroll,
    ]
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}
