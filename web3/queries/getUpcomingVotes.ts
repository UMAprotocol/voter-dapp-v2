import { VotingV2Ethers } from "@uma/contracts-frontend";
import { goerli } from "constants/deployBlocks";

export default function getUpcomingVotes(voting: VotingV2Ethers) {
  const filter = voting.filters.PriceRequestAdded(null, null, null);
  return voting.queryFilter(filter, goerli);
}
