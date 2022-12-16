import gnosisModule from "@web3-onboard/gnosis";
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import walletConnectModule from "@web3-onboard/walletconnect";
import { logo } from "public/assets/logo";
import { appConfig } from "helpers/config";

const injected = injectedModule();
const walletConnect = walletConnectModule();
const gnosis = gnosisModule();

export const initOnboard = init({
  wallets: [injected, walletConnect, gnosis],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum",
      rpcUrl: `https://mainnet.infura.io/v3/${appConfig.infuraId}`,
    },
    {
      id: "0x5",
      token: "GOR",
      label: "Görli",
      rpcUrl: `https://goerli.infura.io/v3/${appConfig.infuraId}`,
    },
  ],
  appMetadata: {
    name: "UMA 2.0",
    icon: logo,
    logo,
    description: "UMA 2.0 Voter Dapp",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
  apiKey: appConfig.blocknativeDappId,
  notify: {
    enabled: false,
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false },
  },
});
