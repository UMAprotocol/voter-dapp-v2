import { VotingV2Ethers } from "@uma/contracts-frontend";
import { createContext, ReactNode, useState } from "react";

interface ContractsContextState {
  voting: VotingV2Ethers | null;
  setVoting: (voting: VotingV2Ethers | null) => void;
}

const defaultContractContextState = {
  voting: null,
  setVoting: () => null,
};

export const ContractsContext = createContext<ContractsContextState>(defaultContractContextState);

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [voting, setVoting] = useState<VotingV2Ethers | null>(null);

  return <ContractsContext.Provider value={{ voting, setVoting }}>{children}</ContractsContext.Provider>;
}
