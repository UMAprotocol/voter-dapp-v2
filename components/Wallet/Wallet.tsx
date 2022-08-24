import { OnboardAPI } from "@web3-onboard/core";
import { useConnectWallet, useWallets } from "@web3-onboard/react";
import message from "constants/signingMessage";
import { ethers } from "ethers";
import { derivePrivateKey, recoverPublicKey } from "helpers/crypto";
import { initOnboard } from "helpers/initOnboard";
import { useContractsContext, usePanelContext, useWalletContext } from "hooks/contexts";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { SigningKey, SigningKeys } from "types/global";
import { createVotingContractInstance, createVotingTokenContractInstance } from "web3/contracts";
import { getAccountDetails } from "./helpers";
import { WalletIcon } from "./WalletIcon";

export function Wallet() {
  const [{ wallet, connecting }, connect] = useConnectWallet();
  const connectedWallets = useWallets();
  const [onboard, setOnboard] = useState<OnboardAPI | null>(null);
  const { setProvider, setSigner, setSigningKeys } = useWalletContext();
  const { setVoting, setVotingToken } = useContractsContext();
  const { setPanelType, setPanelOpen } = usePanelContext();
  const { address, truncatedAddress } = getAccountDetails(connectedWallets);

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
      const provider = new ethers.providers.Web3Provider(wallet.provider);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
      // if a signer exists, we can change the voting contract instance to use it instead of the default `VoidSigner`
      setVoting(createVotingContractInstance(signer));
      setVotingToken(createVotingTokenContractInstance(signer));
      (async () => {
        const savedSigningKeys = getSavedSigningKeys();
        if (savedSigningKeys[address]) {
          setSigningKeys(savedSigningKeys);
        } else {
          const newSigningKey = await makeSigningKey(signer, message);
          const newSigningKeys = { ...savedSigningKeys, [address]: newSigningKey };
          setSigningKeys(newSigningKeys);
          saveSigningKeys(newSigningKeys);
        }
      })();
    }
  }, [address, setProvider, setSigner, setSigningKeys, setVoting, setVotingToken, wallet]);

  async function makeSigningKey(signer: ethers.Signer, message: string) {
    const signedMessage = await signer.signMessage(message);
    const privateKey = derivePrivateKey(signedMessage);
    const publicKey = recoverPublicKey(privateKey);
    return {
      privateKey,
      publicKey,
      signedMessage,
    } as SigningKey;
  }

  function saveSigningKeys(newSigningKeys: SigningKeys) {
    localStorage.setItem("signingKeys", JSON.stringify(newSigningKeys));
  }

  function getSavedSigningKeys() {
    const savedSigningKeys = localStorage.getItem("signingKeys");
    return savedSigningKeys ? (JSON.parse(savedSigningKeys) as SigningKeys) : {};
  }

  function openMenuPanel() {
    setPanelType("menu");
    setPanelOpen(true);
  }

  if (!onboard) return null;

  return (
    <Wrapper>
      {connectedWallets.length ? (
        <WalletButtonWrapper>
          <WalletButton onClick={openMenuPanel}>
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
