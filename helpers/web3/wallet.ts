import { DisconnectOptions, WalletState } from "@web3-onboard/core";
import { ethers } from "ethers";
import { getAddress, truncateEthAddress } from "helpers";
import { createDesignatedVotingFactoryV1Instance } from "web3";

export function handleDisconnectWallet(
  wallet: WalletState | null,
  disconnect: (wallet: DisconnectOptions) => Promise<WalletState[]>,
  setProvider: (provider: ethers.providers.Web3Provider | null) => void,
  setSigner: (signer: ethers.Signer | null) => void
) {
  if (!wallet || !disconnect) return;
  void disconnect(wallet);
  setProvider(null);
  setSigner(null);
  window.localStorage.removeItem("connectedWallets");
}

export function getAccountDetails(connectedWallets?: WalletState[]) {
  const connectedWallet = connectedWallets?.[0];
  const account = connectedWallet?.accounts[0];
  const address = account?.address ? getAddress(account.address) : undefined;
  const truncatedAddress = address ? truncateEthAddress(address) : undefined;
  const walletIcon = connectedWallet?.icon;
  return {
    connectedWallet,
    account,
    address,
    truncatedAddress,
    walletIcon,
  };
}

export async function getDesignatedVotingV1Address(
  address: string | undefined
): Promise<string | undefined> {
  if (!address) return;
  const contract = createDesignatedVotingFactoryV1Instance();
  return contract.designatedVotingContracts(address);
}
