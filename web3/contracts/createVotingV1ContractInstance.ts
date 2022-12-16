import { VotingEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { appConfig } from "helpers/config";

export function createVotingV1ContractInstance(signer?: ethers.Signer) {
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider(
      "goerli",
      appConfig.infuraId
    );
    signer = new ethers.VoidSigner(appConfig.votingV1ContractAddress, provider);
  }
  return VotingEthers__factory.connect(
    appConfig.votingV1ContractAddress,
    signer
  );
}
