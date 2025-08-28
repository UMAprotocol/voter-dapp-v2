// Some locally defined contracts not exported by @uma/contracts-node

import { getAbi } from "@uma/contracts-node";
import { getAddress } from "helpers";
import { SupportedChainIds } from "types";

type ContractInfo = {
  type: string;
  chainId: SupportedChainIds;
  address: string;
  deployBlock: number;
  abi: string[];
};

export const contracts = [
  // managed optimistic oracle v2
  {
    // amoy
    type: "ManagedOptimisticOracleV2",
    chainId: 80002,
    address: getAddress("0xa3dE5F042EFD4C732498883100A2d319BbB3c1A1"),
    deployBlock: 24737019,
    abi: getAbi("OptimisticOracleV2") as string[],
  },
  {
    // polygon
    type: "ManagedOptimisticOracleV2",
    chainId: 137,
    address: getAddress("0x2C0367a9DB231dDeBd88a94b4f6461a6e47C58B1"),
    deployBlock: 74677419,
    abi: getAbi("OptimisticOracleV2") as string[],
  },
] as const satisfies Array<ContractInfo>;

export type LocalContract = (typeof contracts)[number];

export function getContractLocal(
  chainId: number,
  contractName: string
): ContractInfo | undefined {
  return contracts.find(
    (c) => c.chainId === chainId && c.type === contractName
  );
}
