import { VotingV2Ethers__factory } from "@uma/contracts-frontend";
import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ethers } from "ethers";

export default function createVotingContractInstance(signer: ethers.Signer, address: string) {
  const instance: VotingV2Ethers = VotingV2Ethers__factory.connect(address, signer);

  return instance;
}
