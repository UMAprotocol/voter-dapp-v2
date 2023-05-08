import { OnboardAPI } from "@web3-onboard/core";
import { useSetChain } from "@web3-onboard/react";
import { ethers } from "ethers";
import { getSavedSigningKeys, initOnboard } from "helpers";
import { config } from "helpers/config";
import { useSign } from "hooks";
import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { SigningKeys } from "types";

export interface WalletContextState {
  onboard: OnboardAPI | null;
  setOnboard: (onboard: OnboardAPI | null) => void;
  provider: ethers.providers.Web3Provider | null;
  setProvider: (provider: ethers.providers.Web3Provider | null) => void;
  signer: ethers.Signer | null;
  setSigner: (signer: ethers.Signer | null) => void;
  signingKeys: SigningKeys;
  setSigningKeys: (signingKeys: SigningKeys) => void;
  sign: () => void;
  isSigning: boolean;
  connectedChainId: number | undefined;
  isSettingChain: boolean;
  isWrongChain: boolean;
  setCorrectChain: () => void;
}

export const defaultWalletContextState = {
  onboard: null,
  setOnboard: () => null,
  provider: null,
  setProvider: () => null,
  signer: null,
  setSigner: () => null,
  signingKeys: {},
  setSigningKeys: () => null,
  sign: () => null,
  isSigning: false,
  connectedChainId: undefined,
  isSettingChain: false,
  isWrongChain: false,
  setCorrectChain: () => undefined,
};

export const WalletContext = createContext<WalletContextState>(
  defaultWalletContextState
);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [onboard, setOnboard] = useState<OnboardAPI | null>(initOnboard);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [signingKeys, setSigningKeys] = useState<SigningKeys>(
    getSavedSigningKeys()
  );
  const [{ connectedChain, settingChain: isSettingChain }, setChain] =
    useSetChain();

  const { mutate: sign, isLoading: isSigning } = useSign(
    signer,
    setSigningKeys
  );

  const setCorrectChain = useCallback(() => {
    setChain({ chainId: config.onboardConfig.id }).catch((err) =>
      console.error("Error Setting Chain:", err)
    );
  }, [setChain]);

  const connectedChainId = connectedChain
    ? parseInt(connectedChain.id)
    : undefined;

  const isWrongChain = connectedChainId
    ? connectedChainId !== parseInt(config.onboardConfig.id)
    : false;

  const value = useMemo(
    () => ({
      isWrongChain,
      onboard,
      setOnboard,
      provider,
      setProvider,
      signer,
      setSigner,
      signingKeys,
      setSigningKeys,
      sign,
      isSigning,
      connectedChainId,
      setCorrectChain,
      isSettingChain,
    }),
    [
      connectedChainId,
      isSettingChain,
      isSigning,
      isWrongChain,
      onboard,
      provider,
      setCorrectChain,
      sign,
      signer,
      signingKeys,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
