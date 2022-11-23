import { getAbi, getAddress } from "@uma/contracts-node";
import { Contract, ethers } from "ethers";
import { NodeUrls, SupportedChainIdsWithGoerli } from "types";

type GetAddressParams = Parameters<typeof getAddress>;

type GetAbiParams = Parameters<typeof getAbi>;

type ContractName = GetAddressParams[0] & GetAbiParams[0];

export function getProviderByChainId(chainId: SupportedChainIdsWithGoerli) {
  return new ethers.providers.JsonRpcBatchProvider(getNodeUrls()[chainId]);
}

export function getNodeUrls() {
  if (!process.env.NODE_URLS) throw Error("NODE_URLS env variable not set!");
  return JSON.parse(process.env.NODE_URLS) as NodeUrls;
}

export async function constructContractOnChain(
  chainId: SupportedChainIdsWithGoerli,
  contractName: ContractName
) {
  console.log(
    "getting",
    contractName,
    "on chain",
    chainId,
    await getAddress(contractName, chainId)
  );
  return new Contract(
    await getAddress(contractName, chainId),
    getAbi(contractName),
    getProviderByChainId(chainId)
  );
}
