import { config } from "helpers/config";
import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import { formatBytes32String, makePriceRequestsByKey } from "helpers";
import { PastVotesQuery } from "types";

const { graphEndpoint, graphEndpointV1 } = config;

export async function getPastVotesV1() {
  const endpoint = graphEndpointV1;
  if (!endpoint) throw new Error("V1 subgraph is disabled");

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
      latestRound,
      committedVotes,
      revealedVotes,
    }) => {
      const identifier = formatBytes32String(id);
      const correctVote = price;
      const totalTokensVotedWith = Number(latestRound.totalVotesRevealed);
      const participation = {
        uniqueCommitAddresses: revealedVotes.length,
        uniqueRevealAddresses: committedVotes.length,
        totalTokensVotedWith,
      };

      const results = latestRound.groups.map(({ price, totalVoteAmount }) => ({
        vote: price,
        tokensVotedWith: Number(totalVoteAmount),
      }));
      return {
        identifier,
        time: Number(time),
        correctVote,
        ancillaryData,
        priceRequestIndex: undefined,
        participation,
        results,
        isV1: true,
      };
    }
  );
}

export async function getPastVotesV2() {
  const endpoint = graphEndpoint;
  if (!endpoint) throw new Error("V2 subgraph is disabled");
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
      const correctVote = price;
      const priceRequestIndex = BigNumber.from(requestIndex);
      const totalTokensVotedWith = Number(latestRound.totalVotesRevealed);
      const participation = {
        uniqueCommitAddresses: revealedVotes.length,
        uniqueRevealAddresses: committedVotes.length,
        totalTokensVotedWith,
      };
      const results = latestRound.groups.map(({ price, totalVoteAmount }) => ({
        vote: price,
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
