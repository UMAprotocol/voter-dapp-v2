import { VotingV2Ethers } from "@uma/contracts-frontend";
import { goerliDeployBlock } from "constants/deployBlocks";
import { makePriceRequestsByKey } from "helpers";

export default async function getUpcomingVotes(voting: VotingV2Ethers, roundId: number) {
  const filter = voting.filters.PriceRequestAdded(null, null, null);
  const result = await voting.queryFilter(filter, goerliDeployBlock);
  const eventData = result?.map(({ args }) => args);
  const onlyUpcoming = eventData?.filter((event) => event.roundId.toNumber() > roundId);
  const upcomingVotes = makePriceRequestsByKey(onlyUpcoming);
  const hasUpcomingVotes = Object.keys(upcomingVotes).length > 0;

  return {
    hasUpcomingVotes,
    upcomingVotes,
  };
}