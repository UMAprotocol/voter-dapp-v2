import { BigNumber } from "ethers";
import { gql } from "graphql-request";
import { formatBytes32String } from "helpers";
import { config } from "helpers/config";
import { subgraphRequest } from "helpers/util/subgraphRequest";

type UpcomingRequestEntity = {
  identifier: { id: string };
  time: string;
  ancillaryData: string;
  isGovernance: boolean;
  rollCount: string;
  latestRound: { roundId: string };
};

// requests are indexed at RequestAdded time, so unresolved requests whose
// voting round is in the future are exactly the upcoming votes
export async function getUpcomingVotesFromSubgraph(currentRoundId: number) {
  const endpoint = config.graphEndpoint;
  if (!endpoint) throw new Error("V2 subgraph is disabled");

  const query = gql`
    query getUpcomingVotes {
      priceRequests(where: { isResolved: false }, first: 1000) {
        identifier {
          id
        }
        time
        ancillaryData
        isGovernance
        rollCount
        latestRound {
          roundId
        }
      }
    }
  `;

  const result = await subgraphRequest<{
    priceRequests: UpcomingRequestEntity[];
  }>(endpoint, query);

  return result.priceRequests
    .filter(({ latestRound }) => Number(latestRound.roundId) > currentRoundId)
    .map(
      ({
        identifier: { id },
        time,
        ancillaryData,
        isGovernance,
        rollCount,
      }) => ({
        identifier: formatBytes32String(id),
        time: BigNumber.from(time),
        ancillaryData,
        isGovernance,
        rollCount: Number(rollCount),
      })
    );
}
