import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { votingAddress } from "constants/addresses";
import { ethers } from "ethers";

export default function createVotingContractInstance(signer?: ethers.Signer) {
  const address = votingAddress;
  if (!signer) {
    signer = new ethers.VoidSigner(address);
  }
  return VotingV2Ethers__factory.connect(address, signer);
}
