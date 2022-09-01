import graphEndpoint from "constants/graphEndpoint";
import request, { gql } from "graphql-request";

const pastVotesQuery = gql`
  {
    priceRequests(where: { isResolved: true }) {
      id
      identifier {
        id
      }
      price
      time
      ancillaryData
    }
  }
`;

export default function getPastVotes() {
  return request(graphEndpoint, pastVotesQuery);
}
