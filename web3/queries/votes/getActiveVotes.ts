import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makePriceRequestsByKey } from "helpers";
import { resolveAncillaryDataForRequests } from "helpers/voting/resolveAncillaryData";

export async function getActiveVotes(votingContract: VotingV2Ethers) {
  const pendingRequests = await votingContract.getPendingRequests();
  const requestsWithResolvedData = await resolveAncillaryDataForRequests(
    pendingRequests
  );

  const activeVotes = makePriceRequestsByKey(requestsWithResolvedData);
  return activeVotes;
}
