import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { wrongChainMessage } from "constant";
import { ethers } from "ethers";
import {
  useContractsContext,
  useErrorContext,
  usePanelContext,
  useUserContext,
  useWalletContext,
} from "hooks";
import { useEffect } from "react";
import styled from "styled-components";
import {
  createVotingContractInstance,
  createVotingTokenContractInstance,
} from "web3";
import { WalletIcon } from "./WalletIcon";

export function Wallet() {
  const [{ wallet, connecting }, connect] = useConnectWallet();
  const [{ connectedChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();
  const { setProvider, setSigner } = useWalletContext();
  const { setVoting, setVotingToken } = useContractsContext();
  const { openPanel } = usePanelContext();
  const { truncatedAddress } = useUserContext();
  const { addErrorMessage, removeErrorMessage } = useErrorContext();

  useEffect(() => {
    if (!connectedChain) return;

    void (async () => {
      if (connectedChain.id !== "0x5") {
        addErrorMessage(wrongChainMessage);
        await setChain({ chainId: "0x5" });
      } else {
        removeErrorMessage(wrongChainMessage);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedChain?.id, setChain]);

  useEffect(() => {
    if (!connectedWallets.length) return;

    const connectedWalletsLabelArray = connectedWallets.map(
      ({ label }) => label
    );

    window.localStorage.setItem(
      "connectedWallets",
      JSON.stringify(connectedWalletsLabelArray)
    );
  }, [connectedWallets, wallet]);

  useEffect(() => {
    if (!connect || connectedWallets?.length > 0) return;
    const previousConnectedWallets = JSON.parse(
      window.localStorage.getItem("connectedWallets") || "[]"
    ) as string[];

    if (previousConnectedWallets?.length) {
      void (async () => {
        await connect({
          autoSelect: {
            label: previousConnectedWallets[0],
            disableModals: true,
          },
        });
      })();
    }
    // we don't include `connectedWallets` here because otherwise it would run this logic after disconnecting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  useEffect(() => {
    if (!wallet?.provider) {
      setProvider(null);
      setSigner(null);
      setVoting(createVotingContractInstance());
      setVotingToken(createVotingTokenContractInstance());
    } else {
      // After this is set you can use the provider to sign or transact
      const provider = new ethers.providers.Web3Provider(wallet.provider);
      const signer = provider.getSigner();

      setProvider(provider);
      setSigner(signer);
      // if a signer exists, we can change the voting contract instance to use it instead of the default `VoidSigner`
      setVoting(createVotingContractInstance(signer));
      setVotingToken(createVotingTokenContractInstance(signer));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  function openMenuPanel() {
    openPanel("menu");
  }

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
          <WalletButton
            onClick={() => {
              void connect();
            }}
          >
            {connecting ? "Connecting..." : "Connect wallet"}
          </WalletButton>
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
