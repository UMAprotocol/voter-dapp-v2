import { OnboardAPI, WalletState } from "@web3-onboard/core";
import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { initOnboard } from "helpers/initOnboard";
import truncateEthAddress from "helpers/truncateEthAddress";
import { useWalletProviderContext } from "hooks/useWalletProviderContext";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { WalletIcon } from "./WalletIcon";

export function Wallet() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const connectedWallets = useWallets();
  const [onboard, setOnboard] = useState<OnboardAPI | null>(null);
  const { setProvider } = useWalletProviderContext();

  useEffect(() => {
    setOnboard(initOnboard);
  }, []);

  useEffect(() => {
    if (!connectedWallets.length) return;

    const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);

    window.localStorage.setItem("connectedWallets", JSON.stringify(connectedWalletsLabelArray));
  }, [connectedWallets, wallet]);

  useEffect(() => {
    const previousConnectedWallets = JSON.parse(window.localStorage.getItem("connectedWallets") || "[]");

    if (previousConnectedWallets?.length) {
      (async () => {
        await connect({
          autoSelect: {
            label: previousConnectedWallets[0],
            disableModals: true,
          },
        });
      })();
    }
  }, [onboard, connect]);

  useEffect(() => {
    if (!wallet?.provider) {
      setProvider(null);
    } else {
      // After this is set you can use the provider to sign or transact
      setProvider(new ethers.providers.Web3Provider(wallet.provider));
    }
  }, [setProvider, wallet]);

  function handleDisconnectWallet() {
    if (!wallet) return;
    disconnect(wallet);
    window.localStorage.removeItem("connectedWallets");
  }

  if (!onboard) return null;

  const connectedWallet = connectedWallets[0];
  const account = connectedWallet?.accounts[0];
  const address = account?.address ?? "";
  const truncatedAddress = truncateEthAddress(address);

  return (
    <Wrapper>
      {connectedWallets.length ? (
        <WalletButtonWrapper>
          <WalletButton>
            <WalletIcon icon={wallet?.icon} />
            {truncatedAddress}
          </WalletButton>
        </WalletButtonWrapper>
      ) : (
        <WalletButtonWrapper>
          <WalletButton onClick={() => connect()}>{connecting ? "Connecting..." : "Connect wallet"}</WalletButton>
        </WalletButtonWrapper>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 180px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: 15px;
  font: var(--text-md);
  color: var(--black);
  background-color: var(--grey-50);
  border-radius: 5px;
`;

const WalletButtonWrapper = styled.div``;

const WalletButton = styled.button`
  background: none;
  display: flex;
  gap: 15px;
`;
