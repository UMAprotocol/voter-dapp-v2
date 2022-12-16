import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { appConfig } from "helpers/config";

export function createVotingContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider(
      "goerli",
      appConfig.infuraId
    );
    signer = new ethers.VoidSigner(appConfig.votingContractAddress, provider);
  }
  return VotingV2Ethers__factory.connect(
    appConfig.votingContractAddress,
    signer
  );
}
