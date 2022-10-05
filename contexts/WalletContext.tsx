import { OnboardAPI } from "@web3-onboard/core";
import { ethers } from "ethers";
import { initOnboard } from "helpers";
import { createContext, ReactNode, useState } from "react";
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
};

export const WalletContext = createContext<WalletContextState>(defaultWalletContextState);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [onboard, setOnboard] = useState<OnboardAPI | null>(initOnboard);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [signingKeys, setSigningKeys] = useState<SigningKeys>({});

  return (
    <WalletContext.Provider
      value={{ onboard, setOnboard, provider, setProvider, signer, setSigner, signingKeys, setSigningKeys }}
    >
      {children}
    </WalletContext.Provider>
  );
}
