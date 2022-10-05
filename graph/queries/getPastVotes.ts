import graphEndpoint from "constants/graphEndpoint";
import { BigNumber } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";
import request, { gql } from "graphql-request";
import { formatVoteStringWithPrecision, makePriceRequestsByKey } from "helpers";
import { PastVotesQuery } from "types";

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
      requestIndex
    }
  }
`;

export async function getPastVotes() {
  const result = await request<PastVotesQuery>(graphEndpoint, pastVotesQuery);
  const parsedData = result?.priceRequests?.map(({ id, time, price, ancillaryData, requestIndex }) => {
    const identifier = getIdentifierFromPriceRequestId(id);
    const correctVote = Number(formatVoteStringWithPrecision(price, identifier));
    const priceRequestIndex = BigNumber.from(requestIndex);

    return {
      identifier,
      time: Number(time),
      correctVote,
      ancillaryData,
      priceRequestIndex,
    };
  });

  const pastVotes = makePriceRequestsByKey(parsedData ?? []);

  return pastVotes;
}

function getIdentifierFromPriceRequestId(priceRequestId: string) {
  return formatBytes32String(priceRequestId.split("-")[0]);
}
