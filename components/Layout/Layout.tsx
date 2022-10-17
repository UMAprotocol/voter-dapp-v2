import { ErrorBanner, Header } from "components";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
}
export function Layout({ children }: Props) {
  return (
    <Main>
      <ErrorBanner />
      <Header />
      {children}
    </Main>
  );
}

const Main = styled.main`
  height: 100%;
`;
