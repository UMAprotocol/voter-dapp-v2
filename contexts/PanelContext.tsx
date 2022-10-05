import { createContext, ReactNode, useState } from "react";
import { PanelContentT, PanelTypeT } from "types";

export interface PanelContextState {
  panelType: PanelTypeT;
  panelContent: PanelContentT | undefined;
  panelOpen: boolean;
  openPanel: (panelType: PanelTypeT, panelContent?: PanelContentT) => void;
  closePanel: (clearPreviousPanelData?: boolean) => void;
}

export const defaultPanelContextState = {
  panelType: null,
  panelContent: null,
  panelOpen: false,
  openPanel: () => null,
  closePanel: () => null,
};

export const PanelContext = createContext<PanelContextState>(defaultPanelContextState);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panelType, setPanelType] = useState<PanelTypeT>(null);
  const [panelContent, setPanelContent] = useState<PanelContentT | undefined>(null);
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [previousPanelData, setPreviousPanelData] = useState<
    { panelType: PanelTypeT; panelContent: PanelContentT | undefined }[]
  >([]);

  function openPanel(panelType: PanelTypeT, panelContent?: PanelContentT) {
    setPanelType(panelType);
    setPanelContent(panelContent);
    setPanelOpen(true);
    pushPanelDataOntoStack(panelType, panelContent);
  }

  function closePanel(clearPreviousPanelData = false) {
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
  }

  function pushPanelDataOntoStack(panelType: PanelTypeT, panelContent?: PanelContentT) {
    setPreviousPanelData((prev) => {
      return [...prev, { panelType, panelContent }];
    });
  }

  function popPanelDataOffStack() {
    setPreviousPanelData((prev) => {
      return prev.slice(0, prev.length - 1);
    });
  }

  return (
    <PanelContext.Provider
      value={{
        panelType,
        panelContent,
        panelOpen,
        openPanel,
        closePanel,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
}
