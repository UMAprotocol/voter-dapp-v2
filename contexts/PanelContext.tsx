import { createContext, ReactNode, useState } from "react";
import { PanelContentT, PanelTypeT } from "types/global";

interface PanelContextState {
  panelType: PanelTypeT;
  setPanelType: (panelType: PanelTypeT) => void;
  content: PanelContentT;
  setContent: (content: PanelContentT) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const defaultPanelContextState = {
  panelType: null,
  setPanelType: () => null,
  content: null,
  setContent: () => null,
  isOpen: false,
  setIsOpen: () => null,
};

export const PanelContext = createContext<PanelContextState>(defaultPanelContextState);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panelType, setPanelType] = useState<PanelTypeT>(null);
  const [content, setContent] = useState<PanelContentT>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <PanelContext.Provider
      value={{
        panelType,
        setPanelType,
        content,
        setContent,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
}
