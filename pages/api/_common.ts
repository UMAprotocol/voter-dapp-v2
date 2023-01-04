import { getAbi, getAddress } from "@uma/contracts-node";
import { Contract, ethers } from "ethers";
import { NodeUrls, SupportedChainIdsWithGoerli } from "types";
import { supportedChains } from "constant";

type GetAddressParams = Parameters<typeof getAddress>;

type GetAbiParams = Parameters<typeof getAbi>;

export type ContractName = GetAddressParams[0] & GetAbiParams[0];

export function getProviderByChainId(chainId: SupportedChainIdsWithGoerli) {
  return new ethers.providers.JsonRpcBatchProvider(getNodeUrls()[chainId]);
}

export function getNodeUrls() {
  if (!process.env.NODE_URLS) throw Error("NODE_URLS env variable not set!");
  return JSON.parse(process.env.NODE_URLS) as NodeUrls;
}

export async function constructContract(
  chainId: SupportedChainIdsWithGoerli,
  contractName: ContractName
) {
  return new Contract(
    await getAddress(contractName, chainId),
    getAbi(contractName),
    getProviderByChainId(chainId)
  );
}

export function isSupportedChainId(
  chainId: string | number | undefined
): chainId is SupportedChainIdsWithGoerli {
  if (chainId === undefined) return false;
  return chainId in supportedChains;
}

// add block start times here, can also convert this to envs somehow. this is used for augmented request evnets
// and can be used in other places as well to optimize event calls.
export const fromBlocks: Record<string, Record<number | string, number>> = {
  OptimisticOracle: {
    1: 0,
    5: 0,
  },
  OptimisticOracleV2: {
    1: 0,
    5: 0,
  },
  SkinnyOptimisticOracle: {
    1: 0,
    5: 0,
  },
  VotingV2: {
    1: 0,
    5: 0,
  },
  Voting: {
    1: 0,
    5: 0,
  },
};

export function getFromBlock(
  oracleType: string,
  chainId: number,
  fallbackFromBlock = 0
): number {
  return fromBlocks?.[oracleType]?.[chainId] || fallbackFromBlock;
}
