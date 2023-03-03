import {
  VotingEthers,
  VotingTokenEthers,
  VotingV2Ethers,
} from "@uma/contracts-frontend";
import { createContext, ReactNode, useState } from "react";
import {
  createVotingContractInstance,
  createVotingTokenContractInstance,
  createVotingV1ContractInstance,
} from "chain";

export interface ContractsContextState {
  voting: VotingV2Ethers;
  setVoting: (voting: VotingV2Ethers) => void;
  votingToken: VotingTokenEthers;
  setVotingToken: (votingToken: VotingTokenEthers) => void;
  votingV1: VotingEthers;
  setVotingV1: (votingV1: VotingEthers) => void;
}

const defaultVoting = createVotingContractInstance();
const defaultVotingToken = createVotingTokenContractInstance();
const defaultVotingV1 = createVotingV1ContractInstance();

export const defaultContractContextState = {
  voting: defaultVoting,
  setVoting: () => null,
  votingToken: defaultVotingToken,
  setVotingToken: () => null,
  votingV1: defaultVotingV1,
  setVotingV1: () => null,
};

export const ContractsContext = createContext<ContractsContextState>(
  defaultContractContextState
);

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [voting, setVoting] = useState(defaultVoting);
  const [votingToken, setVotingToken] = useState(defaultVotingToken);
  const [votingV1, setVotingV1] = useState(defaultVotingV1);

  return (
    <ContractsContext.Provider
      value={{
        voting,
        setVoting,
        votingToken,
        setVotingToken,
        votingV1,
        setVotingV1,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
}
