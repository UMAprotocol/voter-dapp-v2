import { graphEndpoint, graphEndpointV1 } from "constant";
import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import {
  formatBytes32String,
  formatVoteStringWithPrecision,
  makePriceRequestsByKey,
  parseEther,
} from "helpers";
import { PastVotesQuery } from "types";

export async function getPastVotesV1() {
  const endpoint = graphEndpointV1;
  const pastVotesQuery = gql`
    {
      priceRequests(
        where: { isResolved: true }
        orderBy: time
        orderDirection: desc
      ) {
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
  const result = await request<PastVotesQuery>(endpoint, pastVotesQuery);
  return result?.priceRequests?.map(({ id, time, price, ancillaryData }) => {
    const identifier = getIdentifierFromPriceRequestId(id);
    const correctVote = Number(
      formatVoteStringWithPrecision(parseEther(price), identifier)
    );

    return {
      identifier,
      time: Number(time),
      correctVote,
      ancillaryData,
      priceRequestIndex: undefined,
      isV1: true,
    };
  });
}

export async function getPastVotesV2() {
  const endpoint = graphEndpoint;
  const pastVotesQuery = gql`
    {
      priceRequests(
        where: { isResolved: true }
        orderBy: requestIndex
        orderDirection: desc
      ) {
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
  const result = await request<PastVotesQuery>(endpoint, pastVotesQuery);
  return result?.priceRequests?.map(
    ({ id, time, price, ancillaryData, requestIndex }) => {
      const identifier = getIdentifierFromPriceRequestId(id);
      const correctVote = Number(
        formatVoteStringWithPrecision(parseEther(price), identifier)
      );
      const priceRequestIndex = BigNumber.from(requestIndex);

      return {
        identifier,
        time: Number(time),
        correctVote,
        ancillaryData,
        priceRequestIndex,
        isV1: false,
      };
    }
  );
}

export async function getPastVotes() {
  return makePriceRequestsByKey(await getPastVotesV2());
}

export async function getPastVotesAllVersions() {
  return makePriceRequestsByKey(
    (await Promise.all([getPastVotesV2(), getPastVotesV1()])).flat()
  );
}

function getIdentifierFromPriceRequestId(priceRequestId: string) {
  return formatBytes32String(priceRequestId.split("-")[0]);
}
