import {
  VotingEthers,
  VotingTokenEthers,
  VotingV2Ethers,
} from "@uma/contracts-frontend";
import { ReactNode, createContext, useMemo, useState } from "react";
import {
  createVotingContractInstance,
  createVotingTokenContractInstance,
  createVotingV1ContractInstance,
} from "web3";

export interface ContractsContextState {
  voting: VotingV2Ethers;
  votingWriter: VotingV2Ethers | undefined;
  setVotingWriter: (voting: VotingV2Ethers | undefined) => void;
  votingToken: VotingTokenEthers;
  votingTokenWriter: VotingTokenEthers | undefined;
  setVotingTokenWriter: (votingToken: VotingTokenEthers | undefined) => void;
  votingV1: VotingEthers;
}

const defaultVoting = createVotingContractInstance();
const defaultVotingToken = createVotingTokenContractInstance();
const defaultVotingV1 = createVotingV1ContractInstance();

export const defaultContractContextState = {
  voting: defaultVoting,
  votingWriter: undefined,
  setVotingWriter: () => null,
  votingToken: defaultVotingToken,
  votingTokenWriter: undefined,
  setVotingTokenWriter: () => null,
  votingV1: defaultVotingV1,
};

export const ContractsContext = createContext<ContractsContextState>(
  defaultContractContextState
);

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [votingTokenWriter, setVotingTokenWriter] = useState<
    VotingTokenEthers | undefined
  >(undefined);
  const [votingWriter, setVotingWriter] = useState<VotingV2Ethers | undefined>(
    undefined
  );

  const value = useMemo(
    () => ({
      voting: defaultVoting,
      votingToken: defaultVotingToken,
      votingV1: defaultVotingV1,
      setVotingWriter,
      votingWriter,
      setVotingTokenWriter,
      votingTokenWriter,
    }),
    [votingTokenWriter, votingWriter]
  );

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  );
}
