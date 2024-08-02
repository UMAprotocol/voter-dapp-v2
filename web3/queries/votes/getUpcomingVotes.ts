import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makePriceRequestsByKey } from "helpers";

export async function getUpcomingVotes(
  voting: VotingV2Ethers,
  roundId: number
) {
  const currentBlock = await voting.provider.getBlockNumber();
  const filter = voting.filters.RequestAdded(null, null, null);
  // this needs to look back at least 48 hours for a full voting cycle, lets do 2 full cycles just in case this is roughly 30k blocks
  const result = await voting.queryFilter(filter, currentBlock - 30000);
  const eventData = result?.map(({ args }) => args);
  const onlyUpcoming = eventData?.filter((event) => event.roundId > roundId);
  const upcomingVotes = makePriceRequestsByKey(onlyUpcoming);

  return upcomingVotes;
}
