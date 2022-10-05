import { ErrorBanner, Header } from "components";
import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
  children: ReactNode;
}
export function Layout({ children }: Props) {
  return (
    <Wrapper>
      <ErrorBanner />
      <Header />
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100%;
`;
