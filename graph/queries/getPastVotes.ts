import graphEndpoint from "constants/graphEndpoint";
import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import { formatBytes32String, formatVoteStringWithPrecision, makePriceRequestsByKey, parseEther } from "helpers";
import { PastVotesQuery } from "types";

export async function getPastVotes() {
  const pastVotesQuery = gql`
    {
      priceRequests(where: { isResolved: true }, orderBy: time, orderDirection: desc) {
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
  const result = await request<PastVotesQuery>(graphEndpoint, pastVotesQuery);
  const parsedData = result?.priceRequests?.map(({ id, time, price, ancillaryData, requestIndex }) => {
    const identifier = getIdentifierFromPriceRequestId(id);
    const correctVote = Number(formatVoteStringWithPrecision(parseEther(price), identifier));
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
