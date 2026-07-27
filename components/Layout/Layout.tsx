import {
  ErrorBanner,
  Header,
  OldDesignatedVotingAccountWarningBanner,
} from "components";
import { useInitializeVoteTiming } from "hooks";
import { ReactNode } from "react";
import styled from "styled-components";
import { Meta } from "./Meta";
import { Footer } from "components/Footer/Footer";

interface Props {
  children: ReactNode;
  title: string;
}
export function Layout({ children, title }: Props) {
  useInitializeVoteTiming();

  return (
    <>
      <Meta title={title} />
      <Main>
        <ErrorBanner />
        <OldDesignatedVotingAccountWarningBanner />
        <Header />
        {children}
        <Footer />
      </Main>
    </>
  );
}

const Main = styled.main`
  height: 100%;
`;
