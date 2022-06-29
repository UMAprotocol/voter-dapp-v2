import { OnboardAPI } from "@web3-onboard/core";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { initOnboard } from "helpers/initOnboard";
import { useEffect, useState } from "react";

let provider: ethers.providers.Web3Provider | null;

export function Wallet() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();
  const [onboard, setOnboard] = useState<OnboardAPI | null>(null);

  useEffect(() => {
    setOnboard(initOnboard);
  }, []);

  useEffect(() => {
    if (!connectedWallets.length) return;

    const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);

    window.localStorage.setItem("connectedWallets", JSON.stringify(connectedWalletsLabelArray));
  }, [connectedWallets, wallet]);

  useEffect(() => {
    const previousConnectedWallets = JSON.parse(window.localStorage.getItem("connectedWallets") || "[]");

    if (previousConnectedWallets?.length) {
      (async () => {
        await connect({
          autoSelect: {
            label: previousConnectedWallets[0],
            disableModals: true,
          },
        });
      })();
    }
  }, [onboard, connect]);

  useEffect(() => {
    if (!wallet?.provider) {
      provider = null;
    } else {
      // After this is set you can use the provider to sign or transact
      provider = new ethers.providers.Web3Provider(wallet.provider);
    }
  }, [wallet]);

  async function signMessage() {
    if (!provider) return;
    const signer = provider.getSigner();
    const message = "Hello World";
    const signature = await signer.signMessage(message);
    console.log({ signature });
  }

  if (!onboard) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => connect()}>{connecting ? "connecting" : "connect"}</button>
      {wallet && (
        <div>
          <button onClick={signMessage}>sign</button>
          <label>Switch Chain</label>
          {settingChain ? (
            <span>Switching chain...</span>
          ) : (
            <select
              onChange={({ target: { value } }) => {
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
          <button
            onClick={() => {
              disconnect(wallet);
              window.localStorage.removeItem("connectedWallets");
            }}
          >
            Disconnect Wallet
          </button>
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
