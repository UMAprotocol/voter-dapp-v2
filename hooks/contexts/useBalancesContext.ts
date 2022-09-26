import { BalancesContext } from "contexts/BalancesContext";
import { useContext } from "react";

const useBalancesContext = () => useContext(BalancesContext);

export default useBalancesContext;
