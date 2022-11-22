import { graphEndpoint, graphEndpointV1 } from "constant";
import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import {
  formatBytes32String,
  formatVoteStringWithPrecision,
  makePriceRequestsByKey,
  parseEtherSafe,
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
  return result?.priceRequests?.map(
    ({ identifier: { id }, time, price, ancillaryData }) => {
      const identifier = formatBytes32String(id);
      const correctVote = Number(
        formatVoteStringWithPrecision(parseEtherSafe(price), identifier)
      );

      return {
        identifier,
        time: Number(time),
        correctVote,
        ancillaryData,
        priceRequestIndex: undefined,
        isV1: true,
      };
    }
  );
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
        identifier {
          id
        }
        price
        time
        ancillaryData
        requestIndex
        latestRound {
          totalVotesRevealed
          groups {
            price
            totalVoteAmount
          }
        }
        committedVotes {
          id
        }
        revealedVotes {
          id
        }
      }
    }
  `;
  const result = await request<PastVotesQuery>(endpoint, pastVotesQuery);
  return result?.priceRequests?.map(
    ({
      identifier: { id },
      time,
      price,
      ancillaryData,
      requestIndex,
      latestRound,
      committedVotes,
      revealedVotes,
    }) => {
      const identifier = formatBytes32String(id);
      const correctVote = Number(
        formatVoteStringWithPrecision(parseEtherSafe(price), identifier)
      );
      const priceRequestIndex = BigNumber.from(requestIndex);
      const totalTokensVotedWith = Number(latestRound.totalVotesRevealed);
      const participation = {
        uniqueCommitAddresses: revealedVotes.length,
        uniqueRevealAddresses: committedVotes.length,
        totalTokensVotedWith,
      };
      const results = latestRound.groups.map(({ price, totalVoteAmount }) => ({
        vote: Number(
          formatVoteStringWithPrecision(parseEtherSafe(price), identifier)
        ),
        tokensVotedWith: Number(totalVoteAmount),
      }));
      return {
        identifier,
        time: Number(time),
        correctVote,
        ancillaryData,
        priceRequestIndex,
        isV1: false,
        participation,
        results,
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
