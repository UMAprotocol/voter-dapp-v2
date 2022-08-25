import { ContractsContext } from "contexts/ContractsContext";
import { useContext } from "react";

const useContractsContext = () => useContext(ContractsContext);

export default useContractsContext;
