import { ParsedUrlQuery } from "querystring";
import { ActivityStatusT } from "types";

// The voter dapp supports two deeplink forms, both as query params on any page:
// 1. `?vote=<uniqueKey>` — canonical form, written to the URL bar whenever a
//    vote panel is open, so copying the address bar shares the open vote.
// 2. `?identifier=<string|bytes32Hex>&time=<unixSeconds>&ancillaryData=<0xHex>` —
//    external form for other dapps (oracle dapp, explorer) that know the price
//    request's on-chain fields but not our uniqueKey format. These are resolved
//    to a uniqueKey via /api/resolve-deeplink, which also tolerates being given
//    the L2-side ancillary data of a bridged request.
export const voteDeeplinkQueryParam = "vote";
export const externalDeeplinkQueryParams = [
  "identifier",
  "time",
  "ancillaryData",
] as const;

export type ExternalVoteDeeplink = {
  identifier: string;
  time: number;
  ancillaryData?: string;
};

export type ParsedVoteDeeplink =
  | { form: "uniqueKey"; uniqueKey: string }
  | ({ form: "external" } & ExternalVoteDeeplink);

function getSingleParam(query: ParsedUrlQuery, key: string) {
  const value = query[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseVoteDeeplink(
  query: ParsedUrlQuery
): ParsedVoteDeeplink | undefined {
  const uniqueKey = getSingleParam(query, voteDeeplinkQueryParam);
  if (uniqueKey) return { form: "uniqueKey", uniqueKey };

  const identifier = getSingleParam(query, "identifier");
  const time = Number(getSingleParam(query, "time"));
  if (!identifier || !Number.isInteger(time) || time <= 0) return undefined;

  return {
    form: "external",
    identifier,
    time,
    ancillaryData: getSingleParam(query, "ancillaryData"),
  };
}

export type ResolvedVoteDeeplink = {
  uniqueKey: string;
  activityStatus: ActivityStatusT;
};

export const pathForActivityStatus: Record<ActivityStatusT, string> = {
  active: "/",
  upcoming: "/upcoming-votes",
  past: "/past-votes",
};

/**
 * Builds a URL that opens the voter dapp with the details panel for a specific
 * price request. This is the canonical link-builder for other dapps (oracle
 * dapp, explorer) — copy it as-is, it has no dependencies.
 *
 * @param identifier decoded identifier ("YES_OR_NO_QUERY") or bytes32 hex
 * @param time request timestamp in unix seconds
 * @param ancillaryData 0x-prefixed hex; the DVM (mainnet) ancillary data if you
 *   have it, but the L2/oracle-side data of a bridged request also resolves
 * @param baseUrl defaults to production; pass e.g. "https://testnet.vote.uma.xyz"
 */
export function makeVoterDappDeeplink({
  identifier,
  time,
  ancillaryData,
  baseUrl = "https://vote.uma.xyz",
}: {
  identifier: string;
  time: number | string;
  ancillaryData?: string;
  baseUrl?: string;
}): string {
  const params = new URLSearchParams({ identifier, time: String(time) });
  if (ancillaryData && ancillaryData !== "0x") {
    params.set("ancillaryData", ancillaryData);
  }
  return `${baseUrl}/?${params.toString()}`;
}
