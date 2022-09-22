import graphEndpoint from "constants/graphEndpoint";
import { formatBytes32String } from "ethers/lib/utils";
import request, { gql } from "graphql-request";
import { formatVoteStringWithPrecision } from "helpers/formatVotes";
import makePriceRequestsByKey from "helpers/makePriceRequestsByKey";
import { PastVotesQuery } from "types/global";

const pastVotesQuery = gql`
  {
    priceRequests(where: { isResolved: true }) {
      id
      identifier {
        id
      }
      price
      time
      ancillaryData
    }
  }
`;

export default async function getPastVotes() {
  const result = await request<PastVotesQuery>(graphEndpoint, pastVotesQuery);
  const parsedData = result?.priceRequests?.map(({ id, time, price, ancillaryData }) => {
    const identifier = getIdentifierFromPriceRequestId(id);
    const correctVote = Number(formatVoteStringWithPrecision(price, identifier));

    return {
      identifier,
      time: Number(time),
      correctVote,
      ancillaryData,
    };
  });

  const pastVotes = makePriceRequestsByKey(parsedData ?? []);

  return pastVotes;
}

function getIdentifierFromPriceRequestId(priceRequestId: string) {
  return formatBytes32String(priceRequestId.split("-")[0]);
}
