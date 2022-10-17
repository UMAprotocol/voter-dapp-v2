import { useConnectWallet } from "@web3-onboard/react";
import { Button, Nav, WalletIcon } from "components";
import { handleDisconnectWallet } from "helpers";
import { useUserContext, useWalletContext } from "hooks";
import styled from "styled-components";
import { PanelFooter } from "../PanelFooter";
import { PanelWrapper } from "../styles";

export function MenuPanel() {
  const [_wallets, _connect, disconnect] = useConnectWallet();
  const { setSigner, setProvider } = useWalletContext();
  const { address, connectedWallet, walletIcon } = useUserContext();

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
      title: "Wallet Settings",
      href: "/wallet-settings",
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

  const _links = connectedWallet ? links : links.filter((link) => link.href !== "/wallet-settings");

  return (
    <PanelWrapper>
      <AccountWrapper>
        <Title>Account</Title>
        {connectedWallet ? (
          <>
            <ConnectedWallet>
              <WalletIcon icon={walletIcon} />
              <Address>{address}</Address>
            </ConnectedWallet>
            <Button
              variant="secondary"
              label="Disconnect"
              width={150}
              height={40}
              onClick={() => handleDisconnectWallet(connectedWallet, disconnect, setProvider, setSigner)}
            />
          </>
        ) : (
          <p>TODO implement no wallet</p>
        )}
      </AccountWrapper>
      <Nav links={_links} />
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
