import { useWallets } from "@web3-onboard/react";
import { getAccountDetails } from "helpers";

export function useAccountDetails() {
  const connectedWallets = useWallets();
  return getAccountDetails(connectedWallets);
}
