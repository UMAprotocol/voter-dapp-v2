import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ethers } from "ethers";

export default async function getStakedBalance(votingContract: VotingV2Ethers, address: string) {
  const result = await votingContract.functions.getVoterStake(address);
  return Number(ethers.utils.formatEther(result?.[0]));
}
