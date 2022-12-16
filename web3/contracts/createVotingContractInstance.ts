import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config } from "helpers/config";

export function createVotingContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider(
      config.infuraName,
      config.infuraId
    );
    signer = new ethers.VoidSigner(config.votingContractAddress, provider);
  }
  return VotingV2Ethers__factory.connect(config.votingContractAddress, signer);
}
