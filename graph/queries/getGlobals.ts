import { gql } from "graphql-request";
import { config } from "helpers/config";
import { subgraphRequest } from "helpers/util/subgraphRequest";
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

  const { global } = await subgraphRequest<SubgraphGlobals>(
    graphEndpoint,
    query
  );
  return global;
}
