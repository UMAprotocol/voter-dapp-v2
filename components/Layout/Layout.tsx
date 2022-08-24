import { Header } from "components/Header";
import { Panel } from "components/Panel";
import { usePanelContext } from "hooks/contexts";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export function Layout({ children }: Props) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Panel />
    </>
  );
}
