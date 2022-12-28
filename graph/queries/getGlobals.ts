import request, { gql } from "graphql-request";
import { config } from "helpers/config";
import { SubgraphGlobals } from "types";
const { graphEndpoint } = config;

export async function getGlobals() {
  const query = gql`
    {
      global(id: "global") {
        annualPercentageReturn
      }
    }
  `;

  const { global } = await request<SubgraphGlobals>(graphEndpoint, query);
  return global;
}
