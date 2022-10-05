import { Banner, Layout } from "components";
import { PageInnerWrapper, PageOuterWrapper } from "pages/styles";
import styled from "styled-components";

export function WalletSettings() {
  return (
    <Layout>
      <Banner>Wallet Settings</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper></PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}

function PrimaryWalletBar() {
  return <BarWrapper></BarWrapper>;
}

const BarWrapper = styled.div``;
