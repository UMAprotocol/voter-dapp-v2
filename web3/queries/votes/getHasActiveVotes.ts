import { VotingV2Ethers } from "@uma/contracts-frontend";

export default async function getHasActiveVotes(votingContract: VotingV2Ethers) {
  const result = await votingContract.functions.currentActiveRequests();
  return result?.[0];
}
