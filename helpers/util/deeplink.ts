import { ParsedUrlQuery } from "querystring";
import { ActivityStatusT } from "types";

// The voter dapp supports two deeplink forms, both as query params on any page:
// 1. `?vote=<uniqueKey>` — canonical form, written to the URL bar whenever a
//    vote panel is open, so copying the address bar shares the open vote.
// 2. `?identifier=<string|bytes32Hex>&time=<unixSeconds>&ancillaryDataHash=<0xHash>` —
//    external form for other dapps (oracle dapp, explorer) that know the price
//    request's on-chain fields but not our uniqueKey format. The hash is
//    keccak256 of whichever ancillary data version the caller holds (raw
//    request data, stamped, or DVM-side); /api/resolve-deeplink matches it
//    against every variant it can reconstruct. Full `ancillaryData` is also
//    accepted, but ancillary data is often far too long for a URL.
export const voteDeeplinkQueryParam = "vote";
export const externalDeeplinkQueryParams = [
  "identifier",
  "time",
  "ancillaryData",
  "ancillaryDataHash",
] as const;

export type ExternalVoteDeeplink = {
  identifier: string;
  time: number;
  ancillaryData?: string;
  ancillaryDataHash?: string;
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
    ancillaryDataHash: getSingleParam(query, "ancillaryDataHash"),
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
 * @param ancillaryDataHash keccak256 of the request's ancillary data, e.g.
 *   `ethers.utils.keccak256(request.ancillaryData)`. Hash whichever version
 *   you have — the raw request data, the oracle-stamped data, or the DVM-side
 *   data all resolve. Strongly recommended: identifier+time alone is
 *   ambiguous when several requests share a timestamp.
 * @param ancillaryData full 0x-hex ancillary data; only use when it is short,
 *   URLs have length limits
 * @param baseUrl defaults to production; pass e.g. "https://testnet.vote.uma.xyz"
 */
export function makeVoterDappDeeplink({
  identifier,
  time,
  ancillaryDataHash,
  ancillaryData,
  baseUrl = "https://vote.uma.xyz",
}: {
  identifier: string;
  time: number | string;
  ancillaryDataHash?: string;
  ancillaryData?: string;
  baseUrl?: string;
}): string {
  const params = new URLSearchParams({ identifier, time: String(time) });
  if (ancillaryDataHash) {
    params.set("ancillaryDataHash", ancillaryDataHash);
  } else if (ancillaryData && ancillaryData !== "0x") {
    params.set("ancillaryData", ancillaryData);
  }
  return `${baseUrl}/?${params.toString()}`;
}
