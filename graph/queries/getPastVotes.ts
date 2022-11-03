import { graphEndpoint } from "constant";
import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import {
  formatBytes32String,
  formatVoteStringWithPrecision,
  makePriceRequestsByKey,
  parseEtherSafe,
} from "helpers";
import { PastVotesQuery } from "types";

export async function getPastVotes() {
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
  const result = await request<PastVotesQuery>(graphEndpoint, pastVotesQuery);
  const parsedData = result?.priceRequests?.map(
    ({
      id,
      time,
      price,
      ancillaryData,
      requestIndex,
      latestRound,
      committedVotes,
      revealedVotes,
    }) => {
      const identifier = getIdentifierFromPriceRequestId(id);
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
        participation,
        results,
      };
    }
  );

  const pastVotes = makePriceRequestsByKey(parsedData ?? []);

  return pastVotes;
}

function getIdentifierFromPriceRequestId(priceRequestId: string) {
  return formatBytes32String(priceRequestId.split("-")[0]);
}
