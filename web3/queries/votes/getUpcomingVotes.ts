import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makePriceRequestsByKey } from "helpers";

import { config } from "helpers/config";
const { deployBlock } = config;

export async function getUpcomingVotes(
  voting: VotingV2Ethers,
  roundId: number
) {
  const filter = voting.filters.PriceRequestAdded(null, null, null);
  const result = await voting.queryFilter(filter, deployBlock);
  const eventData = result?.map(({ args }) => args);
  const onlyUpcoming = eventData?.filter(
    (event) => event.roundId.toNumber() > roundId
  );
  const upcomingVotes = makePriceRequestsByKey(onlyUpcoming);
  const hasUpcomingVotes = Object.keys(upcomingVotes).length > 0;

  return {
    hasUpcomingVotes,
    upcomingVotes,
  };
}
