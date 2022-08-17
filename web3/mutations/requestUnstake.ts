import { VotingV2Ethers } from "@uma/contracts-frontend";
import { ethers } from "ethers";

export default async function requestUnstake({
  voting,
  unstakeAmount,
}: {
  voting: VotingV2Ethers;
  unstakeAmount: string;
}) {
  const tx = await voting.functions.requestUnstake(ethers.utils.parseEther(unstakeAmount));
  return await tx.wait(1);
}
