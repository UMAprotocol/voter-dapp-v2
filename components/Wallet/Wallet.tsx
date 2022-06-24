import { init, useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import { ethers } from "ethers";
import { useEffect } from "react";

const injected = injectedModule();
const walletConnect = walletConnectModule();

init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
    },
  ],
});

export function Wallet() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();
  let provider;

  useEffect(() => {
    if (!wallet?.provider) {
      provider = null;
    } else {
      // After this is set you can use the provider to sign or transact
      provider = new ethers.providers.Web3Provider(wallet.provider, "any");
    }
  }, [wallet]);

  return (
    <div>
      <button onClick={() => connect()}>{connecting ? "connecting" : "connect"}</button>
      {wallet && (
        <div>
          <label>Switch Chain</label>
          {settingChain ? (
            <span>Switching chain...</span>
          ) : (
            <select
              onChange={({ target: { value } }) => {
                console.log("onChange called");
                setChain({ chainId: value });
              }}
              value={connectedChain?.id}
            >
              {chains.map(({ id, label }) => {
                return (
                  <option value={id} key={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}
          <button onClick={() => disconnect(wallet)}>Disconnect Wallet</button>
        </div>
      )}

      {connectedWallets.map(({ label, accounts }) => {
        return (
          <div key={label}>
            <div>{label}</div>
            <div>Accounts: {JSON.stringify(accounts, null, 2)}</div>
          </div>
        );
      })}
    </div>
  );
}
