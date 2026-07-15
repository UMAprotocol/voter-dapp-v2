import { VotingV2Ethers } from "@uma/contracts-frontend";
import { voteEventsBlockLookback } from "constant";
import { makePriceRequestsByKey } from "helpers";
import { resolveAncillaryDataForRequests } from "helpers/voting/resolveAncillaryData";

export async function getUpcomingVotes(
  voting: VotingV2Ethers,
  roundId: number
) {
  const currentBlock = await voting.provider.getBlockNumber();
  const filter = voting.filters.RequestAdded(null, null, null);
  const result = await voting.queryFilter(
    filter,
    currentBlock - voteEventsBlockLookback
  );
  const eventData = result?.map(({ args }) => args);
  const onlyUpcoming = eventData?.filter((event) => event.roundId > roundId);
  const requestsWithResolvedData = await resolveAncillaryDataForRequests(
    onlyUpcoming
  );
  const upcomingVotes = makePriceRequestsByKey(requestsWithResolvedData);

  return upcomingVotes;
}
