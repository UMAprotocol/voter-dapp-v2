import { useQueryClient } from "@tanstack/react-query";
import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { Button } from "components/Button";
import { Nav } from "components/Nav";
import { getAccountDetails, handleDisconnectWallet } from "components/Wallet";
import { WalletIcon } from "components/Wallet/WalletIcon";
import { useWalletContext } from "hooks";
import styled from "styled-components";
import { PanelFooter } from "../PanelFooter";
import { PanelWrapper } from "../styles";

const links = [
  {
    title: "Vote",
    href: "/",
  },
  {
    title: "Settled Disputes & Votes",
    href: "/settled",
  },
  {
    title: "Two Key Voting",
    href: "/two-key",
  },
  {
    title: "Optimistic Oracle",
    href: "https://oracle.umaproject.org",
  },
  {
    title: "Docs",
    href: "https://docs.umaproject.org",
  },
];

export function MenuPanel() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const { setSigner, setProvider } = useWalletContext();
  const connectedWallets = useWallets();
  const { address } = getAccountDetails(connectedWallets);
  const queryClient = useQueryClient();

  return (
    <PanelWrapper>
      <AccountWrapper>
        <Title>Account</Title>
        {connectedWallets.length ? (
          <>
            <ConnectedWallet>
              <WalletIcon icon={wallet?.icon} />
              <Address>{address}</Address>
            </ConnectedWallet>
            <Button
              variant="secondary"
              label="Disconnect"
              width={150}
              height={40}
              onClick={() => handleDisconnectWallet(wallet, disconnect, setProvider, setSigner)}
            />
          </>
        ) : (
          <p>TODO implement no wallet</p>
        )}
      </AccountWrapper>
      <Nav links={links} />
      <PanelFooter />
    </PanelWrapper>
  );
}

const AccountWrapper = styled.div`
  min-height: 160px;
  background: var(--grey-100);
  padding-inline: 30px;
  padding-top: 25px;
  padding-bottom: 15px;
`;

const Title = styled.h1`
  font: var(--header-md);
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
