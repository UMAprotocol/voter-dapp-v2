import { AddDelegate } from "./AddDelegate";
import { ConnectedWallet } from "./ConnectedWallet";

export function NoDelegation({
  connectedAddress,
  walletIcon,
  addDelegate,
}: {
  connectedAddress: string;
  walletIcon: string | undefined;
  addDelegate: () => void;
}) {
  return (
    <>
      <ConnectedWallet status="none" address={connectedAddress} walletIcon={walletIcon} />
      <AddDelegate addDelegate={addDelegate} />
    </>
  );
}
