import { VotingTokenEthers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";
import { appConfig } from "helpers/config";

export function createVotingTokenContractInstance(signer?: ethers.Signer) {
  const address = appConfig.votingTokenContractAddress;
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider(
      "goerli",
      process.env.NEXT_PUBLIC_INFURA_ID
    );
    signer = new ethers.VoidSigner(address, provider);
  }
  return VotingTokenEthers__factory.connect(address, signer);
}
