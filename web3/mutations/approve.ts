import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingAddress } from "constants/addresses";
import { BigNumber } from "ethers";

export default async function approve({
  votingToken,
  approveAmount,
}: {
  votingToken: VotingTokenEthers;
  approveAmount: BigNumber;
}) {
  const tx = await votingToken.functions.approve(votingAddress, approveAmount);
  return await tx.wait();
}
