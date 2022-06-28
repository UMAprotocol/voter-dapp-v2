import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import gnosisModule from "@web3-onboard/gnosis";

const injected = injectedModule();
const walletConnect = walletConnectModule();
const gnosis = gnosisModule();

export const initOnboard = init({
  wallets: [injected, walletConnect, gnosis],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
    },
  ],
});
