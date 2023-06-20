import {
  Banner,
  Layout,
  LoadingSpinner,
  LoadingSpinnerWrapper,
  PageInnerWrapper,
  PageOuterWrapper,
} from "components";
import { useDelegationContext } from "hooks";
import { Wallets } from "./Wallets";

export function WalletSettings() {
  const { isLoading: delegationDataLoading } = useDelegationContext();

  return (
    <Layout title="UMA | Wallet Settings">
      <Banner>Wallet Settings</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {delegationDataLoading ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner variant="black" size={40} />
            </LoadingSpinnerWrapper>
          ) : (
            <Wallets />
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}
