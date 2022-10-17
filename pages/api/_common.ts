/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Contract, ethers } from "ethers";

import { getAbi, getAddress } from "@uma/contracts-node";

export function getProviderByChainId(chainId: number) {
  return new ethers.providers.JsonRpcBatchProvider(getNodeUrls()[chainId]);
}

export function getNodeUrls(): { [key: string]: string } {
  if (!process.env.NODE_URLS) throw Error("NODE_URLS env variable not set!");
  return JSON.parse(process.env.NODE_URLS);
}

export async function constructContractOnChain(chainId: number, contractName: any) {
  console.log("getting", contractName, "on chain", chainId, await getAddress(contractName, chainId));
  return new Contract(await getAddress(contractName, chainId), getAbi(contractName), getProviderByChainId(chainId));
}
