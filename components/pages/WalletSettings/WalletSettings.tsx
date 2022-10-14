import { Banner, Layout, LoadingSpinner } from "components";
import { useUserContext } from "hooks";
import { useDelegationContext } from "hooks/contexts/useDelegationContext";
import { useRouter } from "next/router";
import { PageInnerWrapper, PageOuterWrapper } from "pages/styles";
import { useEffect } from "react";
import styled from "styled-components";
import { Wallets } from "./Wallets";

export function WalletSettings() {
  const { address } = useUserContext();
  const { getDelegationDataFetching } = useDelegationContext();
  const router = useRouter();

  useEffect(() => {
    if (!address) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

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
