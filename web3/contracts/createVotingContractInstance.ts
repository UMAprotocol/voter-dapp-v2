import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { votingContractAddress } from "constant/addresses";
import { ethers } from "ethers";

export function createVotingContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider("goerli", process.env.NEXT_PUBLIC_INFURA_ID);
    signer = new ethers.VoidSigner(votingContractAddress, provider);
  }
  return VotingV2Ethers__factory.connect(votingContractAddress, signer);
}
