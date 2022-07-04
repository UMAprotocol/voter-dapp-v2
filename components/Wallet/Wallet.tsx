import { OnboardAPI, WalletState } from "@web3-onboard/core";
import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { Dropdown } from "components/Dropdown";
import { ethers } from "ethers";
import { initOnboard } from "helpers/initOnboard";
import truncateEthAddress from "helpers/truncateEthAddress";
import { useWalletProviderContext } from "hooks/useWalletProviderContext";
import { useEffect, useState } from "react";
import styled from "styled-components";

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

  function makeWalletDropdownItem(wallet: WalletState) {
    const address = wallet.accounts[0].address;
    return {
      value: address,
      label: truncateEthAddress(address),
    };
  }
  return (
    <Wrapper>
      {connectedWallets.length ? (
        <Dropdown
          label={truncateEthAddress(connectedWallets[0].accounts[0].address)}
          items={connectedWallets.map(makeWalletDropdownItem)}
          selected={connectedWallets.map(makeWalletDropdownItem)[0]}
          onSelect={() => null}
        />
      ) : (
        <ConnectWallet>
          <ConnectWalletButton onClick={() => connect()}>
            {connecting ? "Connecting..." : "Connect wallet"}
          </ConnectWalletButton>
        </ConnectWallet>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const ConnectWallet = styled.div`
  width: 200px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: 15px;
  font: var(--text-md);
  color: var(--black);
  background-color: var(--white);
  border: 1.18px solid var(--black);
  border-radius: 5px;
`;

const ConnectWalletButton = styled.button`
  background: none;
`;
