import { WalletContext } from "contexts";
import { useContext } from "react";

const useWalletContext = () => useContext(WalletContext);

export default useWalletContext;
