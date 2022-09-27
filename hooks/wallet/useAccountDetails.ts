import { useWallets } from "@web3-onboard/react";
import { getAccountDetails } from "components";

export default function useAccountDetails() {
  const connectedWallets = useWallets();
  return getAccountDetails(connectedWallets);
}
