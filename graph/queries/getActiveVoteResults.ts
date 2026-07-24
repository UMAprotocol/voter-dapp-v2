import { config } from "helpers/config";
import request, { gql } from "graphql-request";
import { formatBytes32String, makePriceRequestsByKey } from "helpers";
import {
  PastVotesQuery,
  RevealedVotesByAddress,
  VoteParticipationT,
  PriceRequestT,
  VoteResultsT,
  UniqueKeyT,
} from "types";
import { utils, BigNumber } from "ethers";
import { resolveAncillaryDataForRequests } from "helpers/voting/resolveAncillaryData";

const { graphEndpoint } = config;

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
        time: BigNumber.from(time),
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

  return makePriceRequestsByKey(
    await resolveAncillaryDataForRequests(requests)
  );
}
