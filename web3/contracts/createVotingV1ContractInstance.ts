import { VotingEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config, primaryProvider } from "helpers/config";

export function createVotingV1ContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    signer = new ethers.VoidSigner(
      config.votingV1ContractAddress,
      primaryProvider
    );
  }
  return VotingEthers__factory.connect(config.votingV1ContractAddress, signer);
}
