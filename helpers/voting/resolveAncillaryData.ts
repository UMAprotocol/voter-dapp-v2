import { RequestAddedEvent } from "@uma/contracts-frontend/dist/typechain/core/ethers/VotingV2";
import { resolveAncillaryData as resolveAncillaryDataShared } from "lib/l2-ancillary-data";
import { buildSearchParams } from "helpers/util/buildSearchParams";

export async function resolveAncillaryDataForRequests<
  T extends Parameters<typeof resolveAncillaryData>[0]
>(requests: T[]): Promise<(T & { ancillaryDataL2: string })[]> {
  const resolvedAncillaryData = await Promise.all(
    requests.map((request) => resolveAncillaryData(request))
  );
  return requests.map((request, i) => ({
    ...request,
    ancillaryDataL2: resolvedAncillaryData[i],
  }));
}

export async function resolveAncillaryData(
  args: Pick<RequestAddedEvent["args"], "ancillaryData" | "time" | "identifier">
): Promise<string> {
  try {
    // Use the serverless API endpoint for L2 ancillary data resolution
    const response = await fetch(
      `/api/resolve-l2-ancillary-data?${buildSearchParams({
        identifier: args.identifier,
        time: args.time.toString(),
        ancillaryData: args.ancillaryData,
      })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as
      | {
          resolvedAncillaryData: string;
        }
      | {
          error: string;
        };

    if ("error" in result) {
      throw new Error(result.error);
    }

    if (!result.resolvedAncillaryData) {
      throw new Error("No resolved ancillary data returned from API");
    }

    return result.resolvedAncillaryData;
  } catch (error) {
    console.warn("Unable to resolve original ancillary data via API", {
      at: "resolveAncillaryData()",
      data: args,
      cause: error,
    });

    // Fallback to local
    try {
      const result = await resolveAncillaryDataShared(args);
      return result.resolvedAncillaryData;
    } catch (fallbackError) {
      console.error("Fallback resolution also failed", {
        at: "resolveAncillaryData()",
        data: args,
        cause: fallbackError,
      });

      throw fallbackError;
    }
  }
}
