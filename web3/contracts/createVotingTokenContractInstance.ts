import { VotingTokenEthers__factory } from "@uma/contracts-frontend";
import { votingTokenContractAddress } from "constants/addresses";
import { ethers } from "ethers";

export default function createVotingTokenContractInstance(signer?: ethers.Signer) {
  const address = votingTokenContractAddress;
  if (!signer) {
    signer = new ethers.VoidSigner(address);
  }
  return VotingTokenEthers__factory.connect(address, signer);
}
