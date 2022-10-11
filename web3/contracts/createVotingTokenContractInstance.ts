import { VotingTokenEthers__factory } from "@uma/contracts-frontend";
import { votingTokenContractAddress } from "constants/addresses";
import { ethers } from "ethers";

export function createVotingTokenContractInstance(signer?: ethers.Signer) {
  const address = votingTokenContractAddress;
  if (!signer) {
    const provider = new ethers.providers.InfuraProvider("goerli", process.env.NEXT_PUBLIC_INFURA_ID);
    signer = new ethers.VoidSigner(address, provider);
  }
  return VotingTokenEthers__factory.connect(address, signer);
}
