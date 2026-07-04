import { config } from "helpers/config";
import request, { gql } from "graphql-request";
import { formatBytes32String, makePriceRequestsByKey } from "helpers";
import {
  PastVotesQuery,
  PriceRequestRoundQuery,
  RevealedVotesByAddress,
  VoteParticipationT,
  PriceRequestT,
  VoteResultsT,
  UniqueKeyT,
} from "types";
import { utils, BigNumber } from "ethers";
import { resolveAncillaryDataForRequests } from "helpers/voting/resolveAncillaryData";

const { graphEndpoint } = config;

function makeRoundResults(round: PriceRequestRoundQuery) {
  const totalTokensVotedWith = Number(round.totalVotesRevealed);

  // for v1 this data is missing so we need to dynamically check this
  const totalTokensCommitted = round.totalTokensCommitted
    ? Number(round.totalTokensCommitted)
    : undefined;

  const participation = {
    uniqueCommitAddresses: round.committedVotes.length,
    uniqueRevealAddresses: round.revealedVotes.length,
    totalTokensVotedWith,
    totalTokensCommitted,
    minAgreementRequirement: Number(round.minAgreementRequirement),
    minParticipationRequirement: Number(round.minParticipationRequirement),
  };

  const results = round.groups.map(({ price, totalVoteAmount }) => ({
    vote: price,
    tokensVotedWith: Number(totalVoteAmount),
  }));

  return { participation, results };
}

export async function getActiveVoteResults(): Promise<
  Record<UniqueKeyT, PriceRequestT & VoteParticipationT & VoteResultsT>
> {
  const endpoint = graphEndpoint;
  if (!endpoint) throw new Error("V2 subgraph is disabled");
  const pastVotesQuery = gql`
    {
      priceRequests(
        where: { isResolved: false }
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
          minAgreementRequirement
          minParticipationRequirement
          totalTokensCommitted
          groups {
            price
            totalVoteAmount
          }
          committedVotes(first: 1000) {
            id
          }
          revealedVotes(first: 1000) {
            id
            voter {
              address
            }
            price
          }
        }
        rounds(orderBy: roundId, orderDirection: asc, first: 100) {
          roundId
          totalVotesRevealed
          minAgreementRequirement
          minParticipationRequirement
          totalTokensCommitted
          groups {
            price
            totalVoteAmount
          }
          committedVotes(first: 1000) {
            id
          }
          revealedVotes(first: 1000) {
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

  const result = await request<PastVotesQuery>(endpoint, pastVotesQuery);
  const requests = result?.priceRequests?.map(
    ({
      identifier: { id },
      time,
      price,
      ancillaryData,
      resolvedPriceRequestIndex,
      latestRound,
      rounds,
    }) => {
      const identifier = formatBytes32String(id);
      const correctVote = price;
      const { participation, results } = makeRoundResults(latestRound);

      const resultsPerRoll = rounds?.map((round) => ({
        roundId: Number(round.roundId),
        ...makeRoundResults(round),
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
        time: BigNumber.from(time),
        correctVote,
        ancillaryData,
        resolvedPriceRequestIndex,
        isV1: false,
        participation,
        results,
        resultsPerRoll,
        revealedVoteByAddress,
      };
    }
  );

  return makePriceRequestsByKey(
    await resolveAncillaryDataForRequests(requests)
  );
}
