import { AddDelegate } from "./AddDelegate";
import { ConnectedWallet } from "./ConnectedWallet";

export function NoDelegation() {
  return (
    <>
      <ConnectedWallet status="none" />
      <AddDelegate />
    </>
  );
}
