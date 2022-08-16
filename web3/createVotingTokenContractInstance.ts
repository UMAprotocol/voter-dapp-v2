import { VotingTokenEthers__factory } from "@uma/contracts-frontend";
import { votingTokenAddress } from "constants/addresses";
import { ethers } from "ethers";

export default function createVotingContractInstance(signer?: ethers.Signer) {
  const address = votingTokenAddress;
  if (!signer) {
    signer = new ethers.VoidSigner(address);
  }
  return VotingTokenEthers__factory.connect(address, signer);
}
