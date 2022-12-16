import gnosisModule from "@web3-onboard/gnosis";
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import walletConnectModule from "@web3-onboard/walletconnect";
import { logo } from "public/assets/logo";
import { config } from "helpers/config";

const injected = injectedModule();
const walletConnect = walletConnectModule();
const gnosis = gnosisModule();

export const initOnboard = init({
  wallets: [injected, walletConnect, gnosis],
  chains: [config.onboardConfig],
  appMetadata: {
    name: "UMA 2.0",
    icon: logo,
    logo,
    description: "UMA 2.0 Voter Dapp",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
  apiKey: config.blocknativeDappId,
  notify: {
    enabled: false,
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false },
  },
});
