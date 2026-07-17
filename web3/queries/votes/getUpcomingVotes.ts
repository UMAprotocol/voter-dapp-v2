import { VotingV2Ethers } from "@uma/contracts-frontend";
import { voteEventsBlockLookback } from "constant";
import { getUpcomingVotesFromSubgraph } from "graph/queries/getUpcomingVotes";
import { makePriceRequestsByKey } from "helpers";
import { warnOnce } from "helpers/util/log";
import { resolveAncillaryDataForRequests } from "helpers/voting/resolveAncillaryData";
import { queryFilterInChunks } from "helpers/web3/queryFilterInChunks";

// Upcoming votes are eagerly resolved (unlike past votes) because the list is
// small and the cron jobs derive Discord/summary cache keys from the resolved
// titles — do not switch to lazy on-screen resolution here.
export async function getUpcomingVotes(
  voting: VotingV2Ethers,
  roundId: number
) {
  // the subgraph indexes requests as they are added, so prefer it over an
  // event scan; it can lag the chain by a few seconds, which the RequestAdded
  // subscription-triggered refetch and normal staleness absorb
  try {
    const upcoming = await getUpcomingVotesFromSubgraph(roundId);
    return makePriceRequestsByKey(
      await resolveAncillaryDataForRequests(upcoming)
    );
  } catch (error) {
    warnOnce(
      "upcoming-votes-subgraph",
      "Fetching upcoming votes from the subgraph failed, falling back to RPC",
      error
    );
  }

  const currentBlock = await voting.provider.getBlockNumber();
  const filter = voting.filters.RequestAdded(null, null, null);
  const result = await queryFilterInChunks(
    voting,
    filter,
    currentBlock - voteEventsBlockLookback,
    currentBlock
  );
  const onlyUpcoming = result
    ?.map(({ args }) => args)
    .filter((event) => event.roundId > roundId);
  return makePriceRequestsByKey(
    await resolveAncillaryDataForRequests(onlyUpcoming)
  );
}
