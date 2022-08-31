import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getHasActiveVotes(votingContract: VotingV2Ethers) {
  return votingContract.functions.currentActiveRequests();
}
