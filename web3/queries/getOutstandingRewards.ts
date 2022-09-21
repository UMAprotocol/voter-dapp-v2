import { VotingV2Ethers } from "@uma/contracts-frontend";

export default async function getOutstandingRewards(votingContract: VotingV2Ethers, address: string) {
  const result = await votingContract.functions.outstandingRewards(address);
  return result?.[0];
}
