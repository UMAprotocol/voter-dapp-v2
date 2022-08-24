import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ethers } from "ethers";

export default async function stake({ voting, stakeAmount }: { voting: VotingV2Ethers; stakeAmount: string }) {
  const tx = await voting.functions.stake(ethers.utils.parseEther(stakeAmount));
  return await tx.wait();
}
