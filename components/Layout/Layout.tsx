import { Header } from "components/Header";
import { Panel } from "components/Panel";
import { usePanelContext } from "hooks/usePanelContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export function Layout({ children }: Props) {
  const { panelType, panelContent, panelOpen, setPanelOpen } = usePanelContext();

  return (
    <>
      <Header />
      <main>{children}</main>
      <Panel
        isOpen={panelOpen}
        panelType={panelType}
        panelContent={panelContent}
        onDismiss={() => setPanelOpen(false)}
      />
    </>
  );
}
