import { WalletContext } from "contexts/WalletContext";
import { useContext } from "react";

export const useWalletProviderContext = () => useContext(WalletContext);
