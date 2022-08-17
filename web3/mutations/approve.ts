import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingAddress } from "constants/addresses";
import { ethers } from "ethers";

export default async function approve({
  votingToken,
  approveAmount,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: string;
}) {
  const tx = await votingToken.functions.approve(votingAddress, ethers.utils.parseEther(approveAmount));
  return await tx.wait(1);
}
