import { BigNumber, utils } from "ethers";
import { gql, request } from "graphql-request";
import { formatBytes32String, makePriceRequestsByKey } from "helpers";
import { config } from "helpers/config";
import { fetchAllDocuments } from "helpers/util/fetchAllDocuments";
import { resolveAncillaryDataForRequests } from "helpers/voting/resolveAncillaryData";
import {
  PastVotesQuery,
  PriceRequestT,
  RevealedVotesByAddress,
  VoteParticipationT,
  VoteResultsT,
} from "types";

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
        ancillaryDataL2: ancillaryData,
        priceRequestIndex: undefined,
        participation,
        results,
        isV1: true,
        revealedVoteByAddress,
      };
    }
  );
}

// Lightweight query for initial list display
export async function getPastVotesV2Lightweight() {
  const endpoint = graphEndpoint;
  if (!endpoint) throw new Error("V2 subgraph is disabled");
  const pastVotesQuery = gql`
    query getPastVotesLight($skip: Int!, $limit: Int!) {
      priceRequests(
        first: $limit
        skip: $skip
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
      }
    }
  `;

  const result = await fetchAllDocuments<PastVotesQuery>(
    endpoint,
    pastVotesQuery,
    "priceRequests",
    200 // Larger page size since query is lighter
  );

  const results = result?.map(
    ({
      identifier: { id },
      time,
      price,
      ancillaryData,
      resolvedPriceRequestIndex,
    }) => {
      const identifier = formatBytes32String(id);
      return {
        identifier,
        time: Number(time),
        correctVote: price,
        ancillaryData,
        resolvedPriceRequestIndex,
        isV1: false,
        // Placeholder data - will be fetched on demand
        participation: {
          uniqueCommitAddresses: 0,
          uniqueRevealAddresses: 0,
          totalTokensVotedWith: 0,
          totalTokensCommitted: undefined,
          minAgreementRequirement: 0,
          minParticipationRequirement: 0,
        },
        results: [],
        revealedVoteByAddress: {},
      };
    }
  );

  return resolveAncillaryDataForRequests(
    results.map((request) => {
      return {
        ...request,
        time: BigNumber.from(request.time),
      };
    })
  );
}

// Full query with all nested data - for individual vote details
export async function getPastVotesV2() {
  const endpoint = graphEndpoint;
  if (!endpoint) throw new Error("V2 subgraph is disabled");
  const pastVotesQuery = gql`
    query getPastVotes($skip: Int!, $limit: Int!) {
      priceRequests(
        first: $limit
        skip: $skip
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
          totalTokensCommitted
          minAgreementRequirement
          minParticipationRequirement
          groups(first: 100) {
            price
            totalVoteAmount
          }
          committedVotes(first: 100) {
            id
          }
          revealedVotes(first: 100) {
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
    "priceRequests",
    100 // Reduce page size to prevent timeouts
  );

  const results = result?.map(
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

      // for v1 this data is missing so we need to dynamically check this
      const totalTokensCommitted = latestRound.totalTokensCommitted
        ? Number(latestRound.totalTokensCommitted)
        : undefined;

      const participation = {
        uniqueCommitAddresses: latestRound.committedVotes.length,
        uniqueRevealAddresses: latestRound.revealedVotes.length,
        totalTokensVotedWith,
        totalTokensCommitted,
        minAgreementRequirement: Number(latestRound.minAgreementRequirement),
        minParticipationRequirement: Number(
          latestRound.minParticipationRequirement
        ),
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

  return resolveAncillaryDataForRequests(
    results.map((request) => {
      return {
        ...request,
        time: BigNumber.from(request.time),
      };
    })
  );
}

// Query for individual vote details
export async function getPastVoteDetails(
  resolvedPriceRequestIndex: number
): Promise<(PriceRequestT & VoteParticipationT & VoteResultsT) | null> {
  const endpoint = graphEndpoint;
  if (!endpoint) throw new Error("V2 subgraph is disabled");

  const voteDetailsQuery = gql`
    query getVoteDetails($index: Int!) {
      priceRequests(where: { resolvedPriceRequestIndex: $index }) {
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
          totalTokensCommitted
          minAgreementRequirement
          minParticipationRequirement
          groups(first: 100) {
            price
            totalVoteAmount
          }
          committedVotes(first: 100) {
            id
          }
          revealedVotes(first: 100) {
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

  const response = await request<PastVotesQuery>(endpoint, voteDetailsQuery, {
    index: resolvedPriceRequestIndex,
  });

  if (!response?.priceRequests?.[0]) return null;

  const voteData = response.priceRequests[0];
  const {
    identifier: { id },
    time,
    price,
    ancillaryData,
    latestRound,
  } = voteData;

  const identifier = formatBytes32String(id);
  const correctVote = price;
  const totalTokensVotedWith = Number(latestRound.totalVotesRevealed);
  const totalTokensCommitted = latestRound.totalTokensCommitted
    ? Number(latestRound.totalTokensCommitted)
    : undefined;

  const participation = {
    uniqueCommitAddresses: latestRound.committedVotes.length,
    uniqueRevealAddresses: latestRound.revealedVotes.length,
    totalTokensVotedWith,
    totalTokensCommitted,
    minAgreementRequirement: Number(latestRound.minAgreementRequirement),
    minParticipationRequirement: Number(
      latestRound.minParticipationRequirement
    ),
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

  const detailedVote: PriceRequestT & VoteParticipationT & VoteResultsT = {
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

  const [resolved] = await resolveAncillaryDataForRequests([
    {
      ...detailedVote,
      time: BigNumber.from(detailedVote.time),
    },
  ]);

  return resolved;
}

export async function getPastVotes() {
  return makePriceRequestsByKey(await getPastVotesV2Lightweight());
}

export async function getPastVotesAllVersions() {
  return makePriceRequestsByKey(
    (await Promise.all([getPastVotesV2Lightweight(), getPastVotesV1()])).flat()
  );
}
