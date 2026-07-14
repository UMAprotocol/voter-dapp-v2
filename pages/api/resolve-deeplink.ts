import { gql, request as gqlRequest } from "graphql-request";
import { computeRoundId } from "helpers/voting/voteTiming";
import {
  makeUniqueKeyForVote,
  makeUniqueKeyFromAncillaryHash,
} from "helpers/voting/makeUniqueKeyForVote";
import { fetchBridgedEventsAt } from "lib/l2-ancillary-data";
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

// Resolves a deeplink to `{ uniqueKey, activityStatus }`. Two forms:
// - `?vote=<uniqueKey>`: a direct id lookup. The dapp itself never calls this
//   form (it searches its already-loaded lists); it exists for external
//   consumers (explorer, oracle dapp) that hold a uniqueKey and want to know
//   whether/where the vote exists before linking to it.
// - `?identifier=&time=&ancillaryDataHash=` (or full `ancillaryData`): the
//   external form built by makeVoterDappDeeplink; see lib/deeplink-matching
//   for the matching semantics.
// Unknown query params are ignored (ss.type), so shared links that pick up
// trackers (utm_*) still resolve.

const Bytes32Hash = ss.pattern(ss.string(), /^0x[0-9a-fA-F]{64}$/);

const RequestParams = ss.union([
  ss.type({ vote: ss.string() }),
  ss.type({
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
// truncate the candidate set before matching; capped because the endpoint is
// unauthenticated and this loop is its most expensive amplification path
const maxCandidatePages = 5;

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
  let pages = 0;
  do {
    ({ priceRequests: page } = await gqlRequest<{
      priceRequests: PriceRequestEntity[];
    }>(VoteSubgraphURL, query, {
      identifier: decodedIdentifier,
      time,
      skip: pages * pageSize,
      limit: pageSize,
    }));
    allCandidates = allCandidates.concat(page);
    pages += 1;
  } while (page.length === pageSize && pages < maxCandidatePages);
  if (page.length === pageSize) {
    console.warn("Deeplink candidate set truncated", {
      identifier: decodedIdentifier,
      time,
      fetched: allCandidates.length,
    });
  }
  return allCandidates;
}

// Requests bridged in the same batch share (chain, oracle, block), so cache
// the event fetch on exactly that key: matching N same-batch candidates costs
// one RPC call, not N.
function makeMemoizedBridgedEvents() {
  const cache = new Map<string, ReturnType<typeof fetchBridgedEventsAt>>();
  return (args: Parameters<typeof fetchBridgedEventsAt>[0]) => {
    const key = `${args.childChainId}:${args.childOracle.toLowerCase()}:${
      args.childBlockNumber
    }`;
    const cached = cache.get(key);
    if (cached) return cached;
    const pending = fetchBridgedEventsAt(args);
    cache.set(key, pending);
    return pending;
  };
}

// The expensive variant: fetch the candidate's child-chain data via the
// bridge event and compare the caller's hash against it and its pre-stamp
// form. The cheap variants must have been ruled out first.
async function candidateMatchesChildHash(
  candidate: PriceRequestEntity,
  decodedIdentifier: string,
  hash: string,
  fetchEvents: ReturnType<typeof makeMemoizedBridgedEvents>
): Promise<boolean> {
  const bridged = getBridgedFields(candidate.ancillaryData);
  if (!bridged) return false;

  try {
    // inside the try: formatBytes32String throws for identifiers of 32+
    // bytes, which cannot be re-encoded and so cannot match a bridged parent
    const parentRequestId = keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "uint256", "bytes"],
        [
          formatBytes32String(decodedIdentifier),
          candidate.time,
          candidate.ancillaryData ?? "0x",
        ]
      )
    ).toLowerCase();

    const events = await fetchEvents(bridged);
    const event = events.find(
      (e) =>
        (e.args?.parentRequestId as string | undefined)?.toLowerCase() ===
        parentRequestId
    );
    if (!event) return false;
    const childData = event.args?.ancillaryData as string;
    return matchesHexHashVariants(childData, hash);
  } catch (error) {
    console.warn("Unable to fetch child ancillary data for hash match", {
      candidate: candidate.id,
      cause: error,
    });
    return false;
  }
}

// Callers hash whichever ancillary data version they hold, so compare against
// every variant reconstructable per candidate: the DVM-side data, the
// pre-stamp form of it, the compressed hash reference, and (via the bridge
// event) the child-side data and its pre-stamp form. Exactly one candidate
// must match.
async function pickByAncillaryDataHash(
  candidates: PriceRequestEntity[],
  decodedIdentifier: string,
  hash: string
) {
  // IO-free variants first. A single cheap match is decisive without checking
  // the others' child data: another candidate could only share the hash by
  // holding byte-identical data, which requestId uniqueness precludes for the
  // same identifier and time.
  const cheap = candidates.filter((candidate) =>
    matchesCheapHashVariants(candidate.ancillaryData, hash)
  );
  if (cheap.length === 1) return cheap[0];
  if (cheap.length > 1) return undefined;

  // Sequential on purpose: bounded RPC concurrency for this unauthenticated
  // endpoint, and ambiguity aborts before burning further calls. Same-batch
  // candidates still cost one RPC total via the memoized event fetch.
  const fetchEvents = makeMemoizedBridgedEvents();
  const matches: PriceRequestEntity[] = [];
  for (const candidate of candidates) {
    const matched = await candidateMatchesChildHash(
      candidate,
      decodedIdentifier,
      hash,
      fetchEvents
    );
    if (!matched) continue;
    matches.push(candidate);
    if (matches.length > 1) return undefined;
  }
  return matches.length === 1 ? matches[0] : undefined;
}

function getActivityStatus(entity: PriceRequestEntity): ActivityStatusT {
  if (entity.isResolved) return "past";
  // not tied to a round on the subgraph yet — a brand-new request cannot be
  // in the current (active) round
  if (!entity.latestRound) return "upcoming";
  return Number(entity.latestRound.roundId) > computeRoundId()
    ? "upcoming"
    : "active";
}

async function resolveEntity(
  params: ss.Infer<typeof RequestParams>
): Promise<PriceRequestEntity | null | undefined> {
  if ("vote" in params) return findByUniqueKey(params.vote);

  let decodedIdentifier: string;
  try {
    decodedIdentifier = normalizeIdentifier(params.identifier);
  } catch {
    // a bytes32 identifier whose bytes aren't valid UTF-8 can never equal the
    // subgraph's decoded identifier strings — caller input, not a server error
    throw new HttpError({
      statusCode: 400,
      msg: "identifier is not decodable as UTF-8",
    });
  }
  const { time, ancillaryData, ancillaryDataHash } = params;

  // when the caller's data or hash corresponds to the DVM-side data, the
  // uniqueKey is directly constructible — single cheap lookup
  const directHash = ancillaryDataHash ?? undefined;
  const directKey = ancillaryData
    ? makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
    : directHash
    ? makeUniqueKeyFromAncillaryHash(decodedIdentifier, time, directHash)
    : undefined;
  if (directKey) {
    const direct = await findByUniqueKey(directKey);
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
    // The caller said exactly which data they mean and it matched nothing —
    // possibly a request the subgraph hasn't indexed yet. A lone candidate
    // sharing identifier+time is NOT safely "the one": resolving it would
    // return (and CDN-cache) the wrong vote. 404s are cached briefly, so a
    // not-yet-indexed request heals on retry.
    return byHash;
  }
  // identifier+time alone: a single candidate is unambiguous
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
    if (error instanceof HttpError && error.statusCode === 404) {
      // cache misses briefly too — a repeatedly shared dead link shouldn't
      // re-run the whole resolution against the subgraph on every hit
      response.setHeader(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    }
    handleApiError(error, response);
  }
}
