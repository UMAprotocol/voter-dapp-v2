import { ContractsContext } from "contexts/ContractsContext";
import { useContext } from "react";

export const useContractsContext = () => useContext(ContractsContext);
