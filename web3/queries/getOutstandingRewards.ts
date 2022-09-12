import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ethers } from "ethers";

export default async function getOutstandingRewards(votingContract: VotingV2Ethers, address: string) {
  const result = await votingContract.outstandingRewards(address);
  return Number(ethers.utils.formatEther(result));
}
