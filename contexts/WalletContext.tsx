import { ethers } from "ethers";
import { createContext, ReactNode, useState } from "react";

interface WalletContextState {
  provider: ethers.providers.Web3Provider | null;
  setProvider: (provider: ethers.providers.Web3Provider | null) => void;
}

const defaultWalletContextState = {
  provider: null,
  setProvider: () => null,
};

export const WalletContext = createContext<WalletContextState>(defaultWalletContextState);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  return <WalletContext.Provider value={{ provider, setProvider }}>{children}</WalletContext.Provider>;
}
