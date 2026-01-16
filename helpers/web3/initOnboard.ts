import gnosisModule from "@web3-onboard/gnosis";
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import walletConnectModule from "@web3-onboard/walletconnect";
import metamaskModule from "@web3-onboard/metamask";
import { logo } from "public/assets/logo";
import { config } from "helpers/config";

const metamask = metamaskModule({
  options: {
    extensionOnly: false,
    dappMetadata: {
      name: "UMA 2.0 Voter Dapp",
    },
  },
});

const injected = injectedModule();
const walletConnect = walletConnectModule({
  version: 2,
  projectId: config.walletConnectProjectId,
  requiredChains: [config.chainId],
});
const gnosis = gnosisModule();
export const initOnboard = init({
  wallets: [metamask, injected, walletConnect, gnosis],
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
