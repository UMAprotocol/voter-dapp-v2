import { request, gql } from "graphql-request";
const endpoint = `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_THE_GRAPH_API_KEY}/subgraphs/id/0x0a0319671f2d3c18fb55ab555b48bc01f27747a4-0`;

const query = gql`
  query priceRequestRounds($orderBy: String, $orderDirection: String, $numToQuery: Int) {
    priceRequestRounds(first: $numToQuery) {
      id
      identifier {
        id
      }
      roundId
      time
      totalSupplyAtSnapshot
      committedVotes {
        voter {
          address
        }
      }
      revealedVotes {
        numTokens
        price
        voter {
          address
        }
      }
      inflationRate
      rewardsClaimed {
        numTokens
        claimer {
          address
        }
      }
      request {
        price
      }
    }
  }
`;

export default function getPriceRequestRounds(orderBy: string, orderDirection: string, numToQuery: number) {
  return request(endpoint, query, { orderBy, orderDirection, numToQuery });
}
