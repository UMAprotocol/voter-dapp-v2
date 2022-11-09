import { ErrorBanner, Header } from "components";
import { ReactNode } from "react";
import styled from "styled-components";
import { Meta } from "./Meta";

interface Props {
  children: ReactNode;
  title: string;
}
export function Layout({ children, title }: Props) {
  return (
    <>
      <Meta title={title} />
      <Main>
        <ErrorBanner />
        <Header />
        {children}
      </Main>
    </>
  );
}

const Main = styled.main`
  height: 100%;
`;
