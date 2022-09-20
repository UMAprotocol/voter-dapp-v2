import { ErrorBanner } from "components/ErrorBanner";
import { Header } from "components/Header";
import { Panel } from "components/Panel";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export function Layout({ children }: Props) {
  return (
    <>
      <ErrorBanner />
      <Header />
      <main>{children}</main>
      <Panel />
    </>
  );
}
