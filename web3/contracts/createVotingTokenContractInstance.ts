import { VotingTokenEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config, primaryProvider } from "helpers/config";

export function createVotingTokenContractInstance(signer?: ethers.Signer) {
  const address = config.votingTokenContractAddress;
  if (!signer) {
    signer = new ethers.VoidSigner(address, primaryProvider);
  }
  return VotingTokenEthers__factory.connect(address, signer);
}
