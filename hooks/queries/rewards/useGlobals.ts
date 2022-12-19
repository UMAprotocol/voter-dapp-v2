import { useQuery } from "@tanstack/react-query";
import { oneMinute } from "constant";
import { getGlobals } from "graph";

export function useGlobals() {
  return useQuery(["globals"], getGlobals, {
    refetchInterval: oneMinute,
    initialData: {
      annualPercentageReturn: 0,
    },
    onError: (error) =>
      console.error("Error Fetching global data from subgraph:", error),
  });
}
