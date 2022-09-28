import { VotingTokenEthers, VotingV2Ethers } from "@uma/contracts-frontend";
import { createContext, ReactNode, useState } from "react";
import { createVotingContractInstance, createVotingTokenContractInstance } from "web3";

interface ContractsContextState {
  voting: VotingV2Ethers;
  setVoting: (voting: VotingV2Ethers) => void;
  votingToken: VotingTokenEthers;
  setVotingToken: (votingToken: VotingTokenEthers) => void;
}

const defaultVoting = createVotingContractInstance();
const defaultVotingToken = createVotingTokenContractInstance();

const defaultContractContextState = {
  voting: defaultVoting,
  setVoting: () => null,
  votingToken: defaultVotingToken,
  setVotingToken: () => null,
};

export const ContractsContext = createContext<ContractsContextState>(defaultContractContextState);

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [voting, setVoting] = useState<VotingV2Ethers>(defaultVoting);
  const [votingToken, setVotingToken] = useState<VotingTokenEthers>(defaultVotingToken);

  return (
    <ContractsContext.Provider value={{ voting, setVoting, votingToken, setVotingToken }}>
      {children}
    </ContractsContext.Provider>
  );
}
