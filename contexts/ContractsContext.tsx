import { VotingTokenEthers, VotingV2Ethers } from "@uma/contracts-frontend";
import { createContext, ReactNode, useState } from "react";
import {
  createVotingContractInstance,
  createVotingTokenContractInstance,
} from "web3";

export interface ContractsContextState {
  voting: VotingV2Ethers;
  setVoting: (voting: VotingV2Ethers) => void;
  votingToken: VotingTokenEthers;
  setVotingToken: (votingToken: VotingTokenEthers) => void;
}

const defaultVoting = createVotingContractInstance();
const defaultVotingToken = createVotingTokenContractInstance();

export const defaultContractContextState = {
  voting: defaultVoting,
  setVoting: () => null,
  votingToken: defaultVotingToken,
  setVotingToken: () => null,
};

export const ContractsContext = createContext<ContractsContextState>(
  defaultContractContextState
);

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [voting, setVoting] = useState(defaultVoting);
  const [votingToken, setVotingToken] = useState(defaultVotingToken);

  return (
    <ContractsContext.Provider
      value={{ voting, setVoting, votingToken, setVotingToken }}
    >
      {children}
    </ContractsContext.Provider>
  );
}
