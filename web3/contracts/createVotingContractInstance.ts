import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config, primaryProvider } from "helpers/config";

export function createVotingContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    signer = new ethers.VoidSigner(
      config.votingContractAddress,
      primaryProvider
    );
  }
  return VotingV2Ethers__factory.connect(config.votingContractAddress, signer);
}
