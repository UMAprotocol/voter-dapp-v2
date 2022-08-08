import { ethers } from "ethers";
import { createContext, ReactNode, useState } from "react";
import { SigningKeys } from "types/global";

interface WalletContextState {
  provider: ethers.providers.Web3Provider | null;
  setProvider: (provider: ethers.providers.Web3Provider | null) => void;
  signer: ethers.Signer | null;
  setSigner: (signer: ethers.Signer | null) => void;
  signingKeys: SigningKeys;
  setSigningKeys: (signingKeys: SigningKeys) => void;
}

const defaultWalletContextState = {
  provider: null,
  setProvider: () => null,
  signer: null,
  setSigner: () => null,
  signingKeys: {},
  setSigningKeys: () => null,
};

export const WalletContext = createContext<WalletContextState>(defaultWalletContextState);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [signingKeys, setSigningKeys] = useState<SigningKeys>({});

  return (
    <WalletContext.Provider value={{ provider, setProvider, signer, setSigner, signingKeys, setSigningKeys }}>
      {children}
    </WalletContext.Provider>
  );
}
