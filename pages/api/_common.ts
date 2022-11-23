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
  // Replace the logic below with just `getAddress once we've updated the release. Below is just there to pass CI until
  // this is done.
  let contractAddress = await getAddress("Voting", 1);

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
