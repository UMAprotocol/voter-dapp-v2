import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import {
  useContractsContext,
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
  const connectedWallets = useWallets();
  const { setProvider, setSigner, isWrongChain } = useWalletContext();
  const { setVoting, setVotingToken } = useContractsContext();
  const { openPanel } = usePanelContext();
  const { truncatedAddress } = useUserContext();

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
    if (!wallet?.provider || isWrongChain) {
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
  }, [wallet, isWrongChain]);

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
        <WalletButtonPrimaryWrapper>
          <WalletButton
            onClick={() => {
              void connect();
            }}
          >
            {connecting ? "Connecting..." : "Connect wallet"}
          </WalletButton>
        </WalletButtonPrimaryWrapper>
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
  font: var(--text-md);
  color: var(--black);
  background-color: var(--grey-50);
  border-radius: 5px;
`;

const WalletButtonWrapper = styled.div``;

const WalletButtonPrimaryWrapper = styled(Wrapper)`
  color: var(--white);
  background-color: var(--red-500);
  &:hover {
    background-color: var(--red-600);
  }
`;

const WalletButton = styled.button`
  background: none;
  display: flex;
  gap: 15px;
`;
