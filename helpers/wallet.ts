import { DisconnectOptions, WalletState } from "@web3-onboard/core";
import { ethers } from "ethers";
import { truncateEthAddress } from "helpers";

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
  const address = account?.address ?? "";
  const truncatedAddress = address ? truncateEthAddress(address) : undefined;

  return {
    connectedWallet,
    account,
    address,
    truncatedAddress,
  };
}