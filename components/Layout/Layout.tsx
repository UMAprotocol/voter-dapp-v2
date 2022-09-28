import { ErrorBanner, Header, Panel } from "components";
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
