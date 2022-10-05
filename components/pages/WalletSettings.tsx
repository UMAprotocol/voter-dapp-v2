import { Banner, Layout } from "components";
import styled from "styled-components";

export function WalletSettings() {
  return (
    <Layout>
      <Banner>Wallet Settings</Banner>
      <Wrapper></Wrapper>
    </Layout>
  );
}

const Wrapper = styled.div`
  background: var(--grey-100);
  min-height: calc(100% - (var(--banner-height) + var(--header-height)));
`;
