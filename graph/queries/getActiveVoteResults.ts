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
import { utils } from "ethers";

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

  const result = await request<PastVotesQuery>(endpoint, pastVotesQuery);
  return makePriceRequestsByKey(
    result?.priceRequests?.map(
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

        const results = latestRound.groups.map(
          ({ price, totalVoteAmount }) => ({
            vote: price,
            tokensVotedWith: Number(totalVoteAmount),
          })
        );
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
    )
  );
}
