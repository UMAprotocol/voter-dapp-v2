import {
  ErrorBanner,
  Header,
  MigrationBanner,
  OldDesignatedVotingAccountWarningBanner,
} from "components";
import { useInitializeVoteTiming } from "hooks";
import { ReactNode } from "react";
import styled from "styled-components";
import { Meta } from "./Meta";

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
        <MigrationBanner />
        <ErrorBanner />
        <OldDesignatedVotingAccountWarningBanner />
        <Header />
        {children}
      </Main>
    </>
  );
}

const Main = styled.main`
  height: 100%;
`;
