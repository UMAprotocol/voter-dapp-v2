import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingAddress } from "constants/addresses";
import { ethers } from "ethers";

export default async function getTokenAllowance(votingTokenContract: VotingTokenEthers, address: string) {
  const result = await votingTokenContract.functions.allowance(address, votingAddress);
  return Number(ethers.utils.formatEther(result?.[0]));
}
