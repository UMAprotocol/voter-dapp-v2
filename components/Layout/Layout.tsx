import {
  ErrorBanner,
  Header,
  OldDesignatedVotingAccountWarningBanner,
} from "components";
import { useErrorContext, useInitializeVoteTiming } from "hooks";
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
  const { errorsShownInActionBar } = useErrorContext();

  return (
    <>
      <Meta title={title} />
      <Main>
        {errorsShownInActionBar ? null : <ErrorBanner />}
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
