import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getPendingRequests(votingContract: VotingV2Ethers) {
  return votingContract.functions.getPendingRequests();
}
