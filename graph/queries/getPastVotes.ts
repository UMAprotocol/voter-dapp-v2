import { utils } from "ethers";
import request, { gql } from "graphql-request";
import { formatBytes32String, makePriceRequestsByKey } from "helpers";
import { config } from "helpers/config";
import { PastVotesQuery, RevealedVotesByAddress } from "types";

const { graphEndpoint } = config;

export async function getPastVotesV1() {
  const result = (await import("data/pastVotesV1.json"))
    .default as PastVotesQuery;
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
        uniqueCommitAddresses: committedVotes.length,
        uniqueRevealAddresses: revealedVotes.length,
        totalTokensVotedWith,
      };

      const results = latestRound.groups.map(({ price, totalVoteAmount }) => ({
        vote: price,
        tokensVotedWith: Number(totalVoteAmount),
      }));

      const init: RevealedVotesByAddress = {};
      const revealedVoteByAddress = revealedVotes.reduce((result, vote) => {
        result[utils.getAddress(vote.voter.address)] = vote.price;
        return result;
      }, init);

      return {
        identifier,
        time: Number(time),
        correctVote,
        ancillaryData,
        priceRequestIndex: undefined,
        participation,
        results,
        isV1: true,
        revealedVoteByAddress,
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
        orderBy: resolvedPriceRequestIndex
        orderDirection: desc
      ) {
        identifier {
          id
        }
        price
        time
        ancillaryData
        resolvedPriceRequestIndex
        isGovernance
        rollCount
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
          voter {
            address
          }
          price
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
      resolvedPriceRequestIndex,
      latestRound,
      committedVotes,
      revealedVotes,
    }) => {
      const identifier = formatBytes32String(id);
      const correctVote = price;
      const totalTokensVotedWith = Number(latestRound.totalVotesRevealed);
      const participation = {
        uniqueCommitAddresses: committedVotes.length,
        uniqueRevealAddresses: revealedVotes.length,
        totalTokensVotedWith,
      };
      const results = latestRound.groups.map(({ price, totalVoteAmount }) => ({
        vote: price,
        tokensVotedWith: Number(totalVoteAmount),
      }));
      const init: RevealedVotesByAddress = {};
      const revealedVoteByAddress = revealedVotes.reduce((result, vote) => {
        result[utils.getAddress(vote.voter.address)] = vote.price;
        return result;
      }, init);
      return {
        identifier,
        time: Number(time),
        correctVote,
        ancillaryData,
        resolvedPriceRequestIndex,
        isV1: false,
        participation,
        results,
        revealedVoteByAddress,
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
