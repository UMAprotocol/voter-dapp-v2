import { VotingTokenEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { config } from "helpers/config";

export function createVotingTokenContractInstance(signer?: ethers.Signer) {
  const address = config.votingTokenContractAddress;
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider(
      config.infuraName,
      config.infuraId
    );
    signer = new ethers.VoidSigner(address, provider);
  }
  return VotingTokenEthers__factory.connect(address, signer);
}
