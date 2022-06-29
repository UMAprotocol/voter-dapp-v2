import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import gnosisModule from "@web3-onboard/gnosis";
import { logo } from "public/assets/logo";

const injected = injectedModule();
const walletConnect = walletConnectModule();
const gnosis = gnosisModule();

const blocknativeDappId = process.env.NEXT_PUBLIC_BLOCKNATIVE_DAPP_ID;
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;

export const initOnboard = init({
  wallets: [injected, walletConnect, gnosis],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum",
      rpcUrl: `https://mainnet.infura.io/v3/${infuraId}`,
    },
    {
      id: "0x5",
      token: "GOR",
      label: "Görli",
      rpcUrl: `https://goerli.infura.io/v3/${infuraId}`,
    },
  ],
  appMetadata: {
    name: "UMA 2.0",
    icon: logo,
    logo,
    description: "UMA 2.0 Voter Dapp",
    recommendedInjectedWallets: [{ name: "MetaMask", url: "https://metamask.io" }],
  },
  apiKey: blocknativeDappId,
});
