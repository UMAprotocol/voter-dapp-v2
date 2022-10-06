import { Banner, Button, Layout, WalletIcon } from "components";
import { useUserContext } from "hooks";
import { PageInnerWrapper, PageOuterWrapper } from "pages/styles";
import Dot from "public/assets/icons/dot.svg";
import { ReactNode } from "react";
import styled from "styled-components";

export function WalletSettings() {
  const { address, connectedWallet } = useUserContext();
  return (
    <Layout>
      <Banner>Wallet Settings</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          <Header>Primary Wallet</Header>
          <Text>
            Short introduction to why this is here and how it works and more info text info text info text info text
            info text info text info text info text{" "}
          </Text>
          <PrimaryWalletBar address={address} walletIcon={connectedWallet?.icon} />
          <Header>Secondary Wallet</Header>
          <Text>
            Short introduction to why this is here and how it works and more info text info text info text info text
            info text info text info text info text{" "}
          </Text>
          <SecondaryWalletBar address={""} walletIcon={undefined} addWallet={() => {}} />
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}

interface PrimaryWalletProps {
  address: string | undefined;
  walletIcon: string | undefined;
}
function PrimaryWalletBar({ walletIcon, address }: PrimaryWalletProps) {
  return (
    <PrimaryWalletWrapper>
      <ConnectedWallet>
        <WalletIcon icon={walletIcon} />
        <Address>{address || "No primary wallet connected"}</Address>
      </ConnectedWallet>
      <AllowedAction>Staking</AllowedAction>
      <AllowedAction>Voting</AllowedAction>
      <AllowedAction>Claiming Rewards</AllowedAction>
    </PrimaryWalletWrapper>
  );
}

interface SecondaryWalletProps {
  address: string | undefined;
  walletIcon: string | undefined;
  addWallet: () => void;
}
function SecondaryWalletBar({ walletIcon, address, addWallet }: SecondaryWalletProps) {
  return (
    <SecondaryWalletWrapper>
      <ConnectedWallet>
        <WalletIcon icon={walletIcon} />
        <Address>{address || "No secondary wallet connected"}</Address>
      </ConnectedWallet>
      {address ? (
        <></>
      ) : (
        <AddWalletButtonWrapper>
          <Button label="Add wallet" variant="primary" onClick={addWallet} width={160} height={40} />
        </AddWalletButtonWrapper>
      )}
    </SecondaryWalletWrapper>
  );
}

const AddWalletButtonWrapper = styled.div``;

function AllowedAction({ children }: { children: ReactNode }) {
  return (
    <AllowedActionWrapper>
      <AllowedActionIconWrapper>
        <AllowedActionIcon />
      </AllowedActionIconWrapper>
      <AllowedActionLabel>{children}</AllowedActionLabel>
    </AllowedActionWrapper>
  );
}

const AllowedActionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AllowedActionIconWrapper = styled.div`
  margin-left: 25px;
`;

const AllowedActionIcon = styled(Dot)`
  circle {
    fill: var(--green);
  }
`;

const AllowedActionLabel = styled.span`
  font: var(--text-sm);
`;

const BarWrapper = styled.div`
  height: 80px;
  padding-inline: 25px;
  margin-top: 20px;
  margin-bottom: 40px;
  background: var(--white);
  border-radius: 5px;
`;

const PrimaryWalletWrapper = styled(BarWrapper)`
  display: grid;
  align-items: center;
  grid-template-rows: 1fr;
  grid-template-columns: repeat(4, auto);
`;

const SecondaryWalletWrapper = styled(BarWrapper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Header = styled.h1`
  font: var(--header-md);
`;

const Text = styled.p`
  font: var(--text-sm);
  max-width: 737px;
`;

const ConnectedWallet = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Address = styled.p`
  font: var(--text-sm);
  margin-top: 12px;
  margin-bottom: 15px;
`;
