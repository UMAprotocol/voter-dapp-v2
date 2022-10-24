import { VotingV2Ethers } from "@uma/contracts-frontend";

export function getNumberOfVotes(voting: VotingV2Ethers) {
  return voting.getNumberOfPriceRequests();
}
