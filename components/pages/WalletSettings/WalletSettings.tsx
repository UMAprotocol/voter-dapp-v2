import { Banner, Layout } from "components";
import { useUserContext } from "hooks";
import { useDelegationContext } from "hooks/contexts/useDelegationContext";
import { PageInnerWrapper, PageOuterWrapper } from "pages/styles";
import { Wallets } from "./Wallets";

export function WalletSettings() {
  const { address, connectedWallet } = useUserContext();
  const {
    getDelegationStatus,
    getPendingSetDelegateRequestsForDelegate,
    getPendingSetDelegateRequestsForDelegator,
    getDelegateAddress,
    getDelegatorAddress,
  } = useDelegationContext();
  return (
    <Layout>
      <Banner>Wallet Settings</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          <Wallets
            delegationStatus={getDelegationStatus()}
            pendingSetDelegateRequestsForDelegate={getPendingSetDelegateRequestsForDelegate()}
            pendingSetDelegateRequestsForDelegator={getPendingSetDelegateRequestsForDelegator()}
            connectedAddress={address}
            delegateAddress={getDelegateAddress()}
            delegatorAddress={getDelegatorAddress()}
            walletIcon={connectedWallet?.icon}
            addDelegate={() => alert("add delegate")}
            approveDelegateRequest={() => alert("approve delegate request")}
            cancelDelegateRequest={() => alert("cancel delegate request")}
            ignoreDelegateRequest={() => alert("ignore delegate request")}
            removeDelegate={() => alert("remove delegate")}
            removeDelegator={() => alert("remove delegator")}
          />
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}
