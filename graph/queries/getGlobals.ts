// @ts-nocheck
import { gql } from "graphql-request";
import { fetchWithFallback } from "helpers/graph/fetchWithFallback";
import { config } from "helpers/config";
import { SubgraphGlobals } from "types";
const { graphEndpoint, overrideApr } = config;

export async function getGlobals() {
  if (overrideApr) return { annualPercentageReturn: overrideApr };
  if (!graphEndpoint) throw new Error("V2 subgraph is disabled");

  const query = gql`
    {
      global(id: "global") {
        annualPercentageReturn
      }
    }
  `;

  const { global } = await fetchWithFallback<SubgraphGlobals>(query);
  return global;
}
