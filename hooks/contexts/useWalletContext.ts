import { WalletContext } from "contexts/WalletContext";
import { useContext } from "react";

const useWalletContext = () => useContext(WalletContext);

export default useWalletContext;
