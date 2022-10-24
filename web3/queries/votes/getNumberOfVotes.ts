import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getNumberOfVotes(voting: VotingV2Ethers) {
  const result = await voting.getNumberOfPriceRequests();
  return result.toNumber();
}
