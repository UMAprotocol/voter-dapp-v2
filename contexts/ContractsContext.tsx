import { VotingV2Ethers } from "@uma/contracts-frontend";
import { createContext, ReactNode, useState } from "react";
import createVotingContractInstance from "web3/createVotingContractInstance";

interface ContractsContextState {
  voting: VotingV2Ethers;
  setVoting: (voting: VotingV2Ethers) => void;
}

const defaultVoting = createVotingContractInstance();

const defaultContractContextState = {
  voting: defaultVoting,
  setVoting: () => null,
};

export const ContractsContext = createContext<ContractsContextState>(defaultContractContextState);

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [voting, setVoting] = useState<VotingV2Ethers>(defaultVoting);

  return <ContractsContext.Provider value={{ voting, setVoting }}>{children}</ContractsContext.Provider>;
}
