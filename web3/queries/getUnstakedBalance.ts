import { VotingTokenEthers } from "@uma/contracts-frontend";
import { ethers } from "ethers";

export default async function getUnstakedBalance(votingTokenContract: VotingTokenEthers, address: string) {
  const result = await votingTokenContract.functions.balanceOf(address);
  return Number(ethers.utils.formatEther(result?.[0]));
}
