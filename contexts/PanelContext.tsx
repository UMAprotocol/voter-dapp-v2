import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { PanelTypeT, VoteT } from "types";

export interface PanelContextState {
  panelType: PanelTypeT;
  panelContent: VoteT | undefined;
  panelOpen: boolean;
  openPanel: (panelType: PanelTypeT, panelContent?: VoteT) => void;
  closePanel: (clearPreviousPanelData?: boolean) => void;
}

export const defaultPanelContextState = {
  panelType: "menu" as const,
  panelContent: undefined,
  panelOpen: false,
  openPanel: () => null,
  closePanel: () => null,
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

  const openPanel = useCallback(
    (panelType: PanelTypeT, panelContent?: VoteT) => {
      setPanelType(panelType);
      setPanelContent(panelContent);
      setPanelOpen(true);
      pushPanelDataOntoStack(panelType, panelContent);
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
    }),
    [closePanel, openPanel, panelContent, panelOpen, panelType]
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}
