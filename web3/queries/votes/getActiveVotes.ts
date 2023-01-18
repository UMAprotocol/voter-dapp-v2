import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makePriceRequestsByKey } from "helpers";

export async function getActiveVotes(votingContract: VotingV2Ethers) {
  const pendingRequests = await votingContract.callStatic.getPendingRequests();
  const activeVotes = makePriceRequestsByKey(pendingRequests);
  const hasActiveVotes = Object.keys(activeVotes).length > 0;

  return {
    hasActiveVotes,
    activeVotes,
  };
}
