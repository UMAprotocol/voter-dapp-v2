import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export async function getOutstandingRewards(
  votingContract: VotingV2Ethers,
  address: string
) {
  if (!address) return BigNumber.from(0);
  const result = await votingContract.functions.outstandingRewards(address);
  return result?.[0];
}
