import { gql, request as gqlRequest } from "graphql-request";
import { makeUniqueKeyForVote } from "helpers/voting/makeUniqueKeyForVote";
import { fetchAncillaryDataFromSpoke } from "lib/l2-ancillary-data";
import {
  getBridgedFields,
  matchesCheapHashVariants,
  matchesHexHashVariants,
  normalizeIdentifier,
  pickByFullAncillaryData,
} from "lib/deeplink-matching";
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

// Callers hash whichever ancillary data version they hold, so compare against
// every variant reconstructable for this candidate: the DVM-side data, the
// pre-stamp form of it, the compressed hash reference, and (via the bridge
// event) the child-side data and its pre-stamp form.
async function candidateMatchesHash(
  candidate: PriceRequestEntity,
  decodedIdentifier: string,
  hash: string
): Promise<boolean> {
  if (matchesCheapHashVariants(candidate.ancillaryData, hash)) return true;

  const bridged = getBridgedFields(candidate.ancillaryData);
  if (!bridged) return false;

  try {
    const childData = await fetchAncillaryDataFromSpoke({
      parentRequestId: keccak256(
        defaultAbiCoder.encode(
          ["bytes32", "uint256", "bytes"],
          [
            formatBytes32String(decodedIdentifier),
            candidate.time,
            candidate.ancillaryData ?? "0x",
          ]
        )
      ),
      childOracle: bridged.childOracle,
      childChainId: bridged.childChainId,
      childBlockNumber: bridged.childBlockNumber,
    });
    return matchesHexHashVariants(childData, hash);
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
