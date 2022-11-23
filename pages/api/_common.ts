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

export async function constructContractOnChain(
  chainId: number,
  contractName: any
) {
  let contractAddress = await getAddress(contractName, chainId);
  if (chainId == 5) {
    if (contractName === "Voting")
      contractAddress = "0x9f444346FD853084158ce9cfa7e062BaBd51a577";
    else if (contractName === "VotingV2")
      contractAddress = "0xF71cdF8A34c56933A8871354A2570a301364e95F";
  }
  return new Contract(
    contractAddress,
    getAbi(contractName),
    getProviderByChainId(chainId)
  );
}
