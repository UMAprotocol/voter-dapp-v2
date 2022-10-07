import { Banner, Layout } from "components";
import { useUserContext } from "hooks";
import { PageInnerWrapper, PageOuterWrapper } from "pages/styles";
import { Wallets } from "./Wallets";

export function WalletSettings() {
  const { address, connectedWallet } = useUserContext();
  return (
    <Layout>
      <Banner>Wallet Settings</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          <Wallets />
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}
