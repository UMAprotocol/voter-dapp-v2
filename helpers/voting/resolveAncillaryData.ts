import { RequestAddedEvent } from "@uma/contracts-frontend/dist/typechain/core/ethers/VotingV2";
import { decodeHexString } from "helpers/web3/decodeHexString";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { errorOnce, warnOnce } from "helpers/util/log";
import { promiseAllWithConcurrency } from "helpers/util/promiseConcurrency";
import { getBaseUrl } from "helpers/util/http";
import { hasL2AncillaryDataStamp } from "lib/deeplink-matching";
import { resolveAncillaryData as resolveAncillaryDataShared } from "lib/l2-ancillary-data";

// One unresolvable vote must not fail a whole list fetch, so this falls back
// to the original (still-stamped) ancillary data per request — rendered votes
// are healed by useVotesWithResolvedAncillaryData, which retries any vote
// whose data still carries the stamp. Callers that cache a single vote's
// resolution permanently should call resolveAncillaryData directly, which
// throws instead of falling back.
export async function resolveAncillaryDataForRequests<
  T extends Parameters<typeof resolveAncillaryData>[0]
>(requests: T[]): Promise<(T & { ancillaryDataL2: string })[]> {
  const resolvedAncillaryData = await promiseAllWithConcurrency(
    requests.map(
      (request) => () =>
        resolveAncillaryData(request).catch(() => request.ancillaryData)
    )
  );
  return requests.map((request, i) => ({
    ...request,
    ancillaryDataL2: resolvedAncillaryData[i],
  }));
}

export async function resolveAncillaryData(
  args: Pick<RequestAddedEvent["args"], "ancillaryData" | "time" | "identifier">
): Promise<string> {
  // only requests bridged from an L2 spoke carry the stamp and need
  // resolution — everything else resolves to itself with no round-trip
  try {
    if (!hasL2AncillaryDataStamp(decodeHexString(args.ancillaryData))) {
      return args.ancillaryData;
    }
  } catch {
    // undecodable hex can't carry a stamp either
    return args.ancillaryData;
  }

  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/resolve-l2-ancillary-data?${buildSearchParams({
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

    // a still-stamped 200 is a resolution failure the CDN may have cached
    // (pre-existing entries carry a year-long TTL) — fall back to resolving
    // locally rather than accepting it
    if (hasL2AncillaryDataStamp(decodeHexString(result.resolvedAncillaryData))) {
      throw new Error("API returned unresolved ancillary data");
    }

    return result.resolvedAncillaryData;
  } catch (error) {
    // endpoint-level problem, not per-request — log it once, not per vote
    warnOnce(
      "resolve-ancillary-api",
      "Unable to resolve ancillary data via API, falling back to local resolution",
      { at: "resolveAncillaryData()", cause: error }
    );

    // Fallback to local
    try {
      const result = await resolveAncillaryDataShared(args);
      // the shared resolver falls back to the original (still-stamped) value
      // when the child-chain lookup fails — same rule as the API result:
      // that is a failure, not a resolution
      if (
        hasL2AncillaryDataStamp(decodeHexString(result.resolvedAncillaryData))
      ) {
        throw new Error("Local resolution returned unresolved ancillary data");
      }
      return result.resolvedAncillaryData;
    } catch (fallbackError) {
      errorOnce(
        `resolve-ancillary-failed:${args.identifier}:${args.time.toString()}`,
        "Ancillary data resolution failed (API and local fallback)",
        { at: "resolveAncillaryData()", data: args, cause: fallbackError }
      );

      throw fallbackError;
    }
  }
}
