import { VotingEthers__factory } from "@uma/contracts-frontend";
import { votingV1ContractAddress } from "constant";
import { ethers } from "ethers";

export function createVotingV1ContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider(
      "goerli",
      process.env.NEXT_PUBLIC_INFURA_ID
    );
    signer = new ethers.VoidSigner(votingV1ContractAddress, provider);
  }
  return VotingEthers__factory.connect(votingV1ContractAddress, signer);
}
