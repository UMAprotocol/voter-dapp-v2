import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { ethers } from "ethers";

export default function createVotingContractInstance(signer?: ethers.Signer) {
  const address = "0xf21d2478F75D405b6D1e368D313D06B8AD20E088";
  if (!signer) {
    signer = new ethers.VoidSigner(address);
  }
  return VotingV2Ethers__factory.connect(address, signer);
}