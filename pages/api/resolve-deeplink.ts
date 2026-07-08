import { gql, request as gqlRequest } from "graphql-request";
import { decodeHexString, encodeHexString } from "helpers/web3/decodeHexString";
import { makeUniqueKeyForVote } from "helpers/voting/makeUniqueKeyForVote";
import {
  extractMaybeAncillaryDataFields,
  fetchAncillaryDataFromSpoke,
} from "lib/l2-ancillary-data";
import { defaultAbiCoder, keccak256 } from "ethers/lib/utils";
import { formatBytes32String } from "helpers/web3/ethers";
import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { ActivityStatusT } from "types";
import { VoteSubgraphURL } from "./_common";
import { handleApiError, HttpError } from "./_utils/errors";
import { validateQueryParams } from "./_utils/validation";

const phaseLength = Number(process.env.NEXT_PUBLIC_PHASE_LENGTH || 86400);
const roundLength = phaseLength * 2;

const Bytes32Hash = ss.pattern(ss.string(), /^0x[0-9a-fA-F]{64}$/);

const RequestParams = ss.union([
  ss.object({ vote: ss.string() }),
  ss.object({
    identifier: ss.string(),
    time: ss.coerce(ss.integer(), ss.string(), (value) => Number(value)),
    ancillaryData: ss.optional(
      // even-length so keccak256 cannot throw on odd-length hex
      ss.pattern(ss.string(), /^0x([0-9a-fA-F]{2})*$/)
    ),
    ancillaryDataHash: ss.optional(Bytes32Hash),
  }),
]);

type PriceRequestEntity = {
  id: string;
  isResolved: boolean;
  isDeleted: boolean;
  time: string;
  ancillaryData: string | null;
  latestRound: { roundId: string } | null;
};

const priceRequestFields = gql`
  fragment DeeplinkFields on PriceRequest {
    id
    isResolved
    isDeleted
    time
    ancillaryData
    latestRound {
      roundId
    }
  }
`;

async function findByUniqueKey(uniqueKey: string) {
  const query = gql`
    ${priceRequestFields}
    query resolveDeeplink($id: ID!) {
      priceRequest(id: $id) {
        ...DeeplinkFields
      }
    }
  `;
  const result = await gqlRequest<{ priceRequest: PriceRequestEntity | null }>(
    VoteSubgraphURL,
    query,
    { id: uniqueKey }
  );
  return result.priceRequest;
}

// paginated like fetchAllDocuments so large same-timestamp batches cannot
// truncate the candidate set before matching
async function findCandidatesByDetails(
  decodedIdentifier: string,
  time: number
) {
  const query = gql`
    ${priceRequestFields}
    query resolveDeeplinkSearch(
      $identifier: String!
      $time: BigInt!
      $skip: Int!
      $limit: Int!
    ) {
      priceRequests(
        where: { identifier: $identifier, time: $time }
        first: $limit
        skip: $skip
      ) {
        ...DeeplinkFields
      }
    }
  `;
  const pageSize = 1000;
  let allCandidates: PriceRequestEntity[] = [];
  let page: PriceRequestEntity[];
  let skip = 0;
  do {
    ({ priceRequests: page } = await gqlRequest<{
      priceRequests: PriceRequestEntity[];
    }>(VoteSubgraphURL, query, {
      identifier: decodedIdentifier,
      time,
      skip,
      limit: pageSize,
    }));
    allCandidates = allCandidates.concat(page);
    skip += pageSize;
  } while (page.length === pageSize);
  return allCandidates;
}

function pickByFullAncillaryData(
  candidates: PriceRequestEntity[],
  ancillaryData: string
) {
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

const OO_REQUESTER_STAMP = encodeHexString(",ooRequester:").slice(2);

// The stamp is appended as the final key-value pair, so stripping from its
// last occurrence recovers the pre-stamp bytes.
function stripOoRequesterStamp(dataHex: string) {
  const index = dataHex.toLowerCase().lastIndexOf(OO_REQUESTER_STAMP);
  return index === -1 ? undefined : dataHex.slice(0, index);
}

function hashesOfHex(dataHex: string | undefined) {
  if (!dataHex || dataHex === "0x") return [];
  const hashes = [keccak256(dataHex)];
  // a stripped value of "0x" is still meaningful: an OO request with blank
  // caller ancillary data is stamped to just `,ooRequester:<addr>`, and links
  // built from the raw request bytes hash the empty data
  const stripped = stripOoRequesterStamp(dataHex);
  if (stripped) hashes.push(keccak256(stripped));
  return hashes;
}

function decodeAncillaryDataSafe(ancillaryData: string | null) {
  if (!ancillaryData) return undefined;
  try {
    return decodeHexString(ancillaryData);
  } catch {
    return undefined;
  }
}

// Callers hash whichever ancillary data version they hold, so compare against
// every variant reconstructable for this candidate: the DVM-side data, the
// pre-stamp form of it, the compressed hash reference, and (via the bridge
// event) the child-side data and its pre-stamp form.
async function candidateMatchesHash(
  candidate: PriceRequestEntity,
  decodedIdentifier: string,
  hash: string
): Promise<boolean> {
  const mainnetData = candidate.ancillaryData ?? "0x";
  const normalizedHash = hash.toLowerCase();

  if (
    hashesOfHex(mainnetData).some((h) => h.toLowerCase() === normalizedHash)
  ) {
    return true;
  }

  const decoded = decodeAncillaryDataSafe(mainnetData);
  if (!decoded) return false;
  const { ancillaryDataHash, childOracle, childChainId, childBlockNumber } =
    extractMaybeAncillaryDataFields(decoded);
  if (!ancillaryDataHash || !childOracle || !childChainId || !childBlockNumber)
    return false;

  // hash of the stamped child data is embedded in the compressed form
  if (`0x${ancillaryDataHash.toLowerCase()}` === normalizedHash) return true;

  try {
    const childData = await fetchAncillaryDataFromSpoke({
      parentRequestId: keccak256(
        defaultAbiCoder.encode(
          ["bytes32", "uint256", "bytes"],
          [formatBytes32String(decodedIdentifier), candidate.time, mainnetData]
        )
      ),
      childOracle: `0x${childOracle}`,
      childChainId: Number(childChainId),
      childBlockNumber: Number(childBlockNumber),
    });
    return hashesOfHex(childData).some(
      (h) => h.toLowerCase() === normalizedHash
    );
  } catch (error) {
    console.warn("Unable to fetch child ancillary data for hash match", {
      candidate: candidate.id,
      cause: error,
    });
    return false;
  }
}

async function pickByAncillaryDataHash(
  candidates: PriceRequestEntity[],
  decodedIdentifier: string,
  hash: string
) {
  const matches = (
    await Promise.all(
      candidates.map(async (candidate) => ({
        candidate,
        matched: await candidateMatchesHash(candidate, decodedIdentifier, hash),
      }))
    )
  ).filter(({ matched }) => matched);
  return matches.length === 1 ? matches[0].candidate : undefined;
}

// The subgraph identifier id is the decoded string ("YES_OR_NO_QUERY"), but
// callers may pass the on-chain bytes32 form instead.
function normalizeIdentifier(identifier: string) {
  if (/^0x[0-9a-fA-F]{64}$/.test(identifier)) {
    return decodeHexString(identifier);
  }
  return identifier;
}

function getActivityStatus(entity: PriceRequestEntity): ActivityStatusT {
  if (entity.isResolved) return "past";
  const currentRoundId = Math.floor(Date.now() / 1000 / roundLength);
  const latestRoundId = Number(entity.latestRound?.roundId ?? 0);
  return latestRoundId > currentRoundId ? "upcoming" : "active";
}

async function resolveEntity(
  params: ss.Infer<typeof RequestParams>
): Promise<PriceRequestEntity | null | undefined> {
  if ("vote" in params) return findByUniqueKey(params.vote);

  const decodedIdentifier = normalizeIdentifier(params.identifier);
  const { time, ancillaryData, ancillaryDataHash } = params;

  // when the caller's data or hash corresponds to the DVM-side data, the
  // uniqueKey is directly constructible — single cheap lookup
  const directHash = ancillaryDataHash ?? undefined;
  if (ancillaryData || directHash) {
    const uniqueKey = ancillaryData
      ? makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
      : `${decodedIdentifier}-${time}-${directHash?.toLowerCase() ?? ""}`;
    const direct = await findByUniqueKey(uniqueKey);
    if (direct) return direct;
  }

  const candidates = await findCandidatesByDetails(decodedIdentifier, time);
  if (ancillaryData && ancillaryData !== "0x") {
    const byData = pickByFullAncillaryData(candidates, ancillaryData);
    if (byData) return byData;
  }
  // full ancillary data degrades to its hash so both forms resolve the same
  // requests — the hash matcher covers bridged variants that need the child
  // chain's event data, and blank data ("0x") matches stamped-blank requests
  const hash =
    ancillaryDataHash ??
    (ancillaryData ? keccak256(ancillaryData.toLowerCase()) : undefined);
  if (hash) {
    const byHash = await pickByAncillaryDataHash(
      candidates,
      decodedIdentifier,
      hash
    );
    if (byHash) return byHash;
  }
  return candidates.length === 1 ? candidates[0] : undefined;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method !== "GET") {
      throw new HttpError({ statusCode: 405 });
    }
    const params = validateQueryParams(request.query, RequestParams);
    const entity = await resolveEntity(params);

    if (!entity || entity.isDeleted) {
      throw new HttpError({ statusCode: 404, msg: "Vote not found" });
    }

    const activityStatus = getActivityStatus(entity);
    response.setHeader(
      "Cache-Control",
      activityStatus === "past"
        ? "public, s-maxage=31536000, stale-while-revalidate=86400"
        : "public, s-maxage=60, stale-while-revalidate=300"
    );
    response.status(200).json({ uniqueKey: entity.id, activityStatus });
  } catch (error) {
    handleApiError(error, response);
  }
}
