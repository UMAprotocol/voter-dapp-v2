import { useQuery } from "@tanstack/react-query";
import { oneMinute } from "constant";
import { getGlobals } from "graph";
import { config } from "helpers/config";

export function useGlobals() {
  return useQuery(["globals"], getGlobals, {
    refetchInterval: oneMinute,
    initialData: {
      annualPercentageReturn: 0,
    },
    enabled: config.graphV2Enabled,
    onError: (error) =>
      console.error("Error Fetching global data from subgraph:", error),
  });
}
