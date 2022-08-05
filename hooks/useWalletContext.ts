import { WalletContext } from "contexts/WalletContext";
import { useContext } from "react";

export const useWalletContext = () => useContext(WalletContext);
