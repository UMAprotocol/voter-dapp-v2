import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makePriceRequestsByKey } from "helpers";

export async function getActiveVotes(votingContract: VotingV2Ethers) {
  const pendingRequests = await votingContract.getPendingRequests();
  const activeVotes = makePriceRequestsByKey(pendingRequests);
  return activeVotes;
}
