import { DisconnectOptions, WalletState } from "@web3-onboard/core";
import truncateEthAddress from "helpers/truncateEthAddress";

export function handleDisconnectWallet(
  wallet: WalletState | null,
  disconnect?: (wallet: DisconnectOptions) => Promise<void>
) {
  if (!wallet || !disconnect) return;
  disconnect(wallet);
  window.localStorage.removeItem("connectedWallets");
}

export function getAccountDetails(connectedWallets?: WalletState[]) {
  const connectedWallet = connectedWallets?.[0];
  const account = connectedWallet?.accounts[0];
  const address = account?.address ?? "";
  const truncatedAddress = truncateEthAddress(address);

  return {
    connectedWallet,
    account,
    address,
    truncatedAddress,
  };
}
