import { Banner, Layout, LoadingSpinner, PageInnerWrapper, PageOuterWrapper } from "components";
import { useDelegationContext } from "hooks";
import styled from "styled-components";
import { Wallets } from "./Wallets";

export function WalletSettings() {
  const { getDelegationDataFetching } = useDelegationContext();

  return (
    <Layout>
      <Banner>Wallet Settings</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {getDelegationDataFetching() ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner variant="black" size={300} />
            </LoadingSpinnerWrapper>
          ) : (
            <Wallets />
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}

const LoadingSpinnerWrapper = styled.div`
  padding-top: 50px;
  height: 100%;
  display: grid;
  place-items: center;
`;
