import { utils } from "ethers";
import { gql } from "graphql-request";
import { formatBytes32String, makePriceRequestsByKey } from "helpers";
import { config } from "helpers/config";
import { fetchAllDocuments } from "helpers/util/fetchAllDocuments";
import { PastVotesQuery, RevealedVotesByAddress } from "types";

const { chainId, graphEndpoint } = config;

export async function getPastVotesV1() {
  const result =
    chainId === 1
      ? ((await import("data/pastVotesV1.json")).default as PastVotesQuery)
      : { priceRequests: [] };
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
          committedVotes {
            id
            voter {
              voterStake
            }
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
    }
  `;

  const result = await fetchAllDocuments<PastVotesQuery>(
    endpoint,
    pastVotesQuery,
    "priceRequests"
  );

  return result?.map(
    ({
      identifier: { id },
      time,
      price,
      ancillaryData,
      resolvedPriceRequestIndex,
      latestRound,
    }) => {
      const identifier = formatBytes32String(id);
      const correctVote = price;
      const totalTokensVotedWith = Number(latestRound.totalVotesRevealed);
      // no counter field in subgraph entity so we must do this calculation client side
      const totalTokensCommitted = latestRound.committedVotes
        .map((v) => Number(v.voter.voterStake))
        .reduce((acc, curr) => acc + curr, 0);

      const participation = {
        uniqueCommitAddresses: latestRound.committedVotes.length,
        uniqueRevealAddresses: latestRound.revealedVotes.length,
        totalTokensVotedWith,
        totalTokensCommitted,
      };
      const results = latestRound.groups.map(({ price, totalVoteAmount }) => ({
        vote: price,
        tokensVotedWith: Number(totalVoteAmount),
      }));
      const init: RevealedVotesByAddress = {};
      const revealedVoteByAddress = latestRound.revealedVotes.reduce(
        (result, vote) => {
          result[utils.getAddress(vote.voter.address)] = vote.price;
          return result;
        },
        init
      );
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
