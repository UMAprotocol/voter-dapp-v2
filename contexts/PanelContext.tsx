import { createContext, ReactNode, useState } from "react";
import { PanelComponentT, PanelContentT } from "types/global";

interface PanelContextState {
  PanelComponent: PanelComponentT;
  setPanelComponent: (PanelComponent: PanelComponentT) => void;
  content: PanelContentT;
  setContent: (content: PanelContentT) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const defaultPanelContextState = {
  PanelComponent: null,
  setPanelComponent: () => null,
  content: null,
  setContent: () => null,
  isOpen: false,
  setIsOpen: () => null,
};

export const PanelContext = createContext<PanelContextState>(defaultPanelContextState);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [PanelComponent, setPanelComponent] = useState<PanelComponentT>(null);
  const [content, setContent] = useState<PanelContentT>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <PanelContext.Provider
      value={{
        PanelComponent,
        setPanelComponent,
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
