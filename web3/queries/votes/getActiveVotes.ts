import { VotingV2Ethers } from "@uma/contracts-frontend";
import makePriceRequestsByKey from "helpers/makePriceRequestsByKey";

export default async function getPendingRequests(votingContract: VotingV2Ethers) {
  const result = await votingContract.functions.getPendingRequests();
  const pendingRequests = result?.[0];
  const activeVotes = makePriceRequestsByKey(pendingRequests);
  return activeVotes;
}
