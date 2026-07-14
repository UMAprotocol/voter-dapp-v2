import { keccak256 } from "ethers/lib/utils";
import { decodeHexString, encodeHexString } from "helpers/web3/decodeHexString";

// Pure matching logic behind /api/resolve-deeplink: given a set of subgraph
// price-request candidates and the ancillary data (or its hash) an external
// caller holds, decide which candidate — if any — the caller means. Callers
// hold *different versions* of the same request's ancillary data (raw request
// bytes, oracle-stamped, DVM-side, bridged/compressed), so every matcher here
// is deliberately forgiving about which version it is handed.
//
// Everything in this module is pure so it can be unit tested with fixtures;
// the API route owns all IO (subgraph queries, child-chain event fetches).

// Minimal candidate shape the matchers need; the route's subgraph entity
// satisfies it structurally.
export type DeeplinkCandidate = {
  id: string;
  ancillaryData: string | null;
};

export const OO_REQUESTER_STAMP = encodeHexString(",ooRequester:").slice(2);

// The stamp is appended as the final key-value pair, so stripping from its
// last occurrence recovers the pre-stamp bytes. Hex-string offsets are
// nibbles: an odd offset is not a byte boundary, so a match there is a
// coincidental nibble alignment inside binary data, not the stamp — and
// slicing at it would produce odd-length hex that keccak256 rejects.
export function stripOoRequesterStamp(dataHex: string) {
  const lower = dataHex.toLowerCase();
  let index = lower.lastIndexOf(OO_REQUESTER_STAMP);
  while (index > 0 && index % 2 !== 0) {
    index = lower.lastIndexOf(OO_REQUESTER_STAMP, index - 1);
  }
  return index === -1 ? undefined : dataHex.slice(0, index);
}

export function hashesOfHex(dataHex: string | undefined) {
  if (!dataHex || dataHex === "0x") return [];
  const hashes = [keccak256(dataHex)];
  // a stripped value of "0x" is still meaningful: an OO request with blank
  // caller ancillary data is stamped to just `,ooRequester:<addr>`, and links
  // built from the raw request bytes hash the empty data
  const stripped = stripOoRequesterStamp(dataHex);
  if (stripped) hashes.push(keccak256(stripped));
  return hashes;
}

export function decodeAncillaryDataSafe(ancillaryData: string | null) {
  if (!ancillaryData) return undefined;
  try {
    return decodeHexString(ancillaryData);
  } catch {
    return undefined;
  }
}

export function pickByFullAncillaryData<T extends DeeplinkCandidate>(
  candidates: T[],
  ancillaryData: string
): T | undefined {
  const normalized = ancillaryData.toLowerCase();
  const exact = candidates.find(
    (candidate) => candidate.ancillaryData?.toLowerCase() === normalized
  );
  if (exact) return exact;

  // Requests reaching the DVM from an oracle contract have the original
  // ancillary data "stamped", so the requesting side's data is a byte-prefix
  // of what the DVM stores. Requiring the remainder to be the stamp prevents
  // an unrelated same-batch request that merely begins with the same bytes
  // from stealing the match.
  const stamped = candidates.filter((candidate) => {
    const data = candidate.ancillaryData?.toLowerCase();
    return (
      data?.startsWith(normalized) &&
      data.slice(normalized.length).startsWith(OO_REQUESTER_STAMP)
    );
  });
  if (stamped.length === 1) return stamped[0];

  // Requests bridged via AncillaryDataCompression replace the data with
  // `ancillaryDataHash:<keccak256(childData)>,childBlockNumber:...`, so match
  // the hash of the provided data against the compressed form.
  const providedDataHash = keccak256(normalized).slice(2);
  const compressed = candidates.filter((candidate) =>
    decodeAncillaryDataSafe(candidate.ancillaryData)?.startsWith(
      `ancillaryDataHash:${providedDataHash},`
    )
  );
  if (compressed.length === 1) return compressed[0];

  return undefined;
}

// Parses the decoded form of AncillaryDataCompression's replacement data:
// `ancillaryDataHash:...,childBlockNumber:...,childOracle:...,
// childRequester:...,childChainId:...`. Lives here (not in l2-ancillary-data)
// so it stays importable without the env-validated provider config.
export function extractMaybeAncillaryDataFields(decodedAncillaryData: string) {
  const pattern = new RegExp(
    "^" +
      "ancillaryDataHash:(\\w+),\\s*" +
      "childBlockNumber:(\\d+),\\s*" +
      "childOracle:(\\w+),\\s*" +
      "childRequester:(\\w+),\\s*" +
      "childChainId:(\\d+)" +
      "$"
  );

  const match = decodedAncillaryData.match(pattern);
  if (!match) return {};

  return {
    ancillaryDataHash: match[1],
    childBlockNumber: match[2],
    childOracle: match[3],
    childRequester: match[4],
    childChainId: match[5],
  };
}

export type BridgedAncillaryDataFields = {
  ancillaryDataHash: string;
  childOracle: string;
  childChainId: number;
  childBlockNumber: number;
};

// Bridged (compressed) requests carry a reference to the child-chain data
// instead of the data itself. Returns undefined unless every field needed to
// locate the child data is present.
export function getBridgedFields(
  ancillaryData: string | null
): BridgedAncillaryDataFields | undefined {
  const decoded = decodeAncillaryDataSafe(ancillaryData);
  if (!decoded) return undefined;
  const { ancillaryDataHash, childOracle, childChainId, childBlockNumber } =
    extractMaybeAncillaryDataFields(decoded);
  if (!ancillaryDataHash || !childOracle || !childChainId || !childBlockNumber)
    return undefined;
  return {
    ancillaryDataHash,
    childOracle: `0x${childOracle}`,
    childChainId: Number(childChainId),
    childBlockNumber: Number(childBlockNumber),
  };
}

// True when the caller's hash is keccak256 of the given data or of its
// pre-stamp form.
export function matchesHexHashVariants(
  dataHex: string | undefined,
  hash: string
): boolean {
  const normalizedHash = hash.toLowerCase();
  return hashesOfHex(dataHex).some((h) => h.toLowerCase() === normalizedHash);
}

// Hash variants checkable without any IO: the DVM-side data, its pre-stamp
// form, and — for bridged requests — the child-data hash embedded in the
// compressed form.
export function matchesCheapHashVariants(
  mainnetData: string | null,
  hash: string
): boolean {
  const normalizedHash = hash.toLowerCase();
  if (matchesHexHashVariants(mainnetData ?? "0x", normalizedHash)) return true;
  const bridged = getBridgedFields(mainnetData);
  return (
    !!bridged &&
    `0x${bridged.ancillaryDataHash.toLowerCase()}` === normalizedHash
  );
}

// The subgraph identifier id is the decoded string ("YES_OR_NO_QUERY"), but
// callers may pass the on-chain bytes32 form instead.
export function normalizeIdentifier(identifier: string) {
  if (/^0x[0-9a-fA-F]{64}$/.test(identifier)) {
    return decodeHexString(identifier);
  }
  return identifier;
}
