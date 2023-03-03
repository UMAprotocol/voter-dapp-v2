import { VotingEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config } from "helpers/config";

export function createVotingV1ContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider(
      config.infuraName,
      config.infuraId
    );
    signer = new ethers.VoidSigner(config.votingV1ContractAddress, provider);
  }
  return VotingEthers__factory.connect(config.votingV1ContractAddress, signer);
}
