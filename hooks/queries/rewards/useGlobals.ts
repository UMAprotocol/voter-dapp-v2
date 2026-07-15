import { useQuery } from "@tanstack/react-query";
import { oneMinute } from "constant";
import { getGlobals } from "graph";
import { config } from "helpers/config";
import { warnOnce } from "helpers/util/log";

export function useGlobals() {
  return useQuery({
    queryKey: ["globals"],
    queryFn: getGlobals,
    refetchInterval: oneMinute,
    enabled: config.graphV2Enabled,
    onError: (error) =>
      warnOnce(
        "globals-subgraph",
        "Error Fetching global data from subgraph:",
        error
      ),
  });
}
