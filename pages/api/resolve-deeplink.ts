import { utils } from "ethers";
import { gql, request as gqlRequest } from "graphql-request";
import { decodeHexString } from "helpers/web3/decodeHexString";
import { makeUniqueKeyForVote } from "helpers/voting/makeUniqueKeyForVote";
import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { ActivityStatusT } from "types";
import { VoteSubgraphURL } from "./_common";
import { handleApiError, HttpError } from "./_utils/errors";
import { validateQueryParams } from "./_utils/validation";

const phaseLength = Number(process.env.NEXT_PUBLIC_PHASE_LENGTH || 86400);
const roundLength = phaseLength * 2;

const RequestParams = ss.union([
  ss.object({ vote: ss.string() }),
  ss.object({
    identifier: ss.string(),
    time: ss.coerce(ss.integer(), ss.string(), (value) => Number(value)),
    ancillaryData: ss.optional(ss.pattern(ss.string(), /^0x[0-9a-fA-F]*$/)),
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

async function findByDetails(
  decodedIdentifier: string,
  time: number,
  ancillaryData: string | undefined
) {
  const query = gql`
    ${priceRequestFields}
    query resolveDeeplinkSearch($identifier: String!, $time: BigInt!) {
      priceRequests(where: { identifier: $identifier, time: $time }) {
        ...DeeplinkFields
      }
    }
  `;
  const { priceRequests: candidates } = await gqlRequest<{
    priceRequests: PriceRequestEntity[];
  }>(VoteSubgraphURL, query, { identifier: decodedIdentifier, time });

  if (!ancillaryData || ancillaryData === "0x") {
    return candidates.length === 1 ? candidates[0] : undefined;
  }

  const normalized = ancillaryData.toLowerCase();
  const exact = candidates.find(
    (candidate) => candidate.ancillaryData?.toLowerCase() === normalized
  );
  if (exact) return exact;

  // Requests reaching the DVM from an oracle contract have the original
  // ancillary data "stamped" (suffixed with ooRequester/childChainId), so the
  // requesting side's data is a byte-prefix of what the DVM stores.
  const stamped = candidates.filter((candidate) =>
    candidate.ancillaryData?.toLowerCase().startsWith(normalized)
  );
  if (stamped.length === 1) return stamped[0];

  // Requests bridged via AncillaryDataCompression replace the data with
  // `ancillaryDataHash:<keccak256(childData)>,childBlockNumber:...`, so match
  // the hash of the provided data against the compressed form.
  const providedDataHash = utils.keccak256(normalized).slice(2);
  const compressed = candidates.filter((candidate) =>
    decodeAncillaryDataSafe(candidate.ancillaryData)?.startsWith(
      `ancillaryDataHash:${providedDataHash},`
    )
  );
  if (compressed.length === 1) return compressed[0];

  return candidates.length === 1 ? candidates[0] : undefined;
}

function decodeAncillaryDataSafe(ancillaryData: string | null) {
  if (!ancillaryData) return undefined;
  try {
    return decodeHexString(ancillaryData);
  } catch {
    return undefined;
  }
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

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    if (request.method !== "GET") {
      throw new HttpError({ statusCode: 405 });
    }
    const params = validateQueryParams(request.query, RequestParams);

    let entity: PriceRequestEntity | null | undefined;
    if ("vote" in params) {
      entity = await findByUniqueKey(params.vote);
    } else {
      const decodedIdentifier = normalizeIdentifier(params.identifier);
      if (params.ancillaryData) {
        entity = await findByUniqueKey(
          makeUniqueKeyForVote(
            decodedIdentifier,
            params.time,
            params.ancillaryData
          )
        );
      }
      entity ??= await findByDetails(
        decodedIdentifier,
        params.time,
        params.ancillaryData
      );
    }

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
