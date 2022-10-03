import { createContext, ReactNode, useState } from "react";
import { PanelContentT, PanelTypeT } from "types";

export interface PanelContextState {
  panelType: PanelTypeT;
  setPanelType: (panelType: PanelTypeT) => void;
  panelContent: PanelContentT;
  setPanelContent: (panelContent: PanelContentT) => void;
  panelOpen: boolean;
  setPanelOpen: (panelOpen: boolean) => void;
}

export const defaultPanelContextState = {
  panelType: null,
  setPanelType: () => null,
  panelContent: null,
  setPanelContent: () => null,
  panelOpen: false,
  setPanelOpen: () => null,
};

export const PanelContext = createContext<PanelContextState>(defaultPanelContextState);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panelType, setPanelType] = useState<PanelTypeT>(null);
  const [panelContent, setPanelContent] = useState<PanelContentT>(null);
  const [panelOpen, setPanelOpen] = useState<boolean>(false);

  return (
    <PanelContext.Provider
      value={{
        panelType,
        setPanelType,
        panelContent,
        setPanelContent,
        panelOpen,
        setPanelOpen,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
}
