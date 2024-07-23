import request, { gql } from "graphql-request";
import assert from "assert";
import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { makeUniqueKeyForVote, decodeHexString } from "helpers";
import { isSupportedChainId, getSubgraphConfig } from "./_common";

const debug = !!process.env.DEBUG;
const VoteSubgraphURL =
  process.env.NEXT_PUBLIC_GRAPH_ENDPOINT ??
  "https://api.thegraph.com/subgraphs/name/md0x/mainnet-voting-v2";

const RequestBody = ss.object({
  ancillaryData: ss.string(),
  time: ss.number(),
  identifier: ss.string(),
});

type RequestBody = ss.Infer<typeof RequestBody>;

type OracleQueryParams = RequestBody & { chainId: number };

export const ResponseBody = ss.object({
  uniqueKey: ss.string(),
  time: ss.number(),
  identifier: ss.string(),
  l1RequestTxHash: ss.optional(ss.string()),
  ooRequestUrl: ss.optional(ss.string()),
  originatingChainTxHash: ss.optional(ss.string()),
  originatingChainId: ss.optional(ss.number()),
  originatingOracleType: ss.optional(ss.string()),
  optimisticOracleV3Data: ss.optional(
    ss.object({
      assertionId: ss.optional(ss.string()),
      domainId: ss.optional(ss.string()),
      claim: ss.optional(ss.string()),
      asserter: ss.optional(ss.string()),
      callbackRecipient: ss.optional(ss.string()),
      escalationManager: ss.optional(ss.string()),
      expirationTime: ss.optional(ss.number()),
      caller: ss.optional(ss.string()),
    })
  ),
});
export type ResponseBody = ss.Infer<typeof ResponseBody>;

function extractChildChainId(ancillaryData: string): number | undefined {
  const childChainIdRegex = /childChainId:(\d+)/;
  const match = ancillaryData.match(childChainIdRegex);
  return match ? Number(match[1]) : undefined;
}
function constructOoUiLink(
  txHash: string | undefined,
  chainId: string | number | undefined,
  oracleType: string | undefined,
  eventIndex: string | undefined
) {
  if (!txHash || !chainId || !oracleType) return;
  if (!isSupportedChainId(chainId)) return;
  const subDomain = Number(chainId) === 5 ? "testnet." : "";
  return `https://${subDomain}oracle.uma.xyz/request?transactionHash=${txHash}&chainId=${chainId}&oracleType=${castOracleNameForOOUi(
    oracleType
  )}&eventIndex=${eventIndex ?? ""}`;
}

function castOracleNameForOOUi(oracleType: string): string {
  switch (oracleType) {
    case "OptimisticOracle":
      return "Optimistic";
    case "OptimisticOracleV2":
      return "OptimisticV2";
    case "SkinnyOptimisticOracle":
      return "Skinny";
    case "OptimisticOracleV3":
      return "OptimisticV3";
    default:
      throw new Error("Unable to cast oracle name for OO UI: " + oracleType);
  }
}

async function voteQuery({
  time,
  identifier,
  ancillaryData,
}: Omit<OracleQueryParams, "chainId">) {
  const id = makeUniqueKeyForVote(identifier, time, ancillaryData);
  const query = gql`
    query voteQuery($id: ID!) {
      priceRequest(id: $id) {
        requestTransaction
      }
    }
  `;
  type GqlRequest = {
    requestTransaction: string;
  };
  type GqlResponse = {
    priceRequest: GqlRequest | undefined | null;
  };
  try {
    const data: GqlResponse = await request(VoteSubgraphURL, query, { id });
    assert(data.priceRequest, "request not found");
    return data?.priceRequest;
  } catch (error) {
    if (debug) console.error("vote fetch error:", error);
    throw error;
  }
}
async function ooSkinnyQuery({
  time,
  identifier,
  chainId,
}: OracleQueryParams): Promise<ResponseBody> {
  const subgraph = getSubgraphConfig("Skinny Optimistic Oracle", chainId);
  const query = gql`
    query skinnyQuery($proposalTimestamp: Int!) {
      optimisticPriceRequests(
        where: { proposalTimestamp: $proposalTimestamp }
      ) {
        id
        requestHash
        requestLogIndex
      }
    }
  `;
  type GqlRequest = {
    id: string;
    requestHash: string;
    requestLogIndex: string;
  };
  type GqlResponse = {
    optimisticPriceRequests: GqlRequest[];
  };

  try {
    const data: GqlResponse = await request(subgraph.url, query, {
      proposalTimestamp: time,
    });
    assert(data.optimisticPriceRequests.length > 0, "request not found");
    const [optimisticPriceRequest] = data.optimisticPriceRequests;
    const requestHash = optimisticPriceRequest?.requestHash;
    const requestLogIndex = optimisticPriceRequest?.requestLogIndex;
    return {
      time,
      uniqueKey: optimisticPriceRequest.id,
      identifier,
      ooRequestUrl: constructOoUiLink(
        requestHash,
        chainId,
        "SkinnyOptimisticOracle",
        requestLogIndex
      ),
      originatingChainTxHash: requestHash,
      originatingChainId: chainId,
      originatingOracleType: "SkinnyOptimisticOracle",
    };
  } catch (error) {
    if (debug) console.error("oo skinny error:", error);
    throw error;
  }
}
async function oov3Query({
  time,
  identifier,
  chainId,
}: OracleQueryParams): Promise<ResponseBody> {
  const subgraph = getSubgraphConfig("Optimistic Oracle V3", chainId);
  const query = gql`
    query oov3Query($assertionTimestamp: Int!) {
      assertions(where: { assertionTimestamp: $assertionTimestamp }) {
        id
        assertionHash
        assertionLogIndex
        assertionTimestamp
        domainId
        claim
        asserter
        callbackRecipient
        escalationManager
        expirationTime
        caller
      }
    }
  `;
  type GqlRequest = {
    id: string;
    assertionHash: string;
    assertionLogIndex: number;
    assertionTimestamp: number;
    domainId: string;
    claim: string;
    asserter: string;
    callbackRecipient: string;
    escalationManager: string;
    expirationTime: number;
    caller: string;
  };
  type GqlResponse = {
    assertions: GqlRequest[];
  };

  try {
    const data: GqlResponse = await request(subgraph.url, query, {
      assertionTimestamp: time,
    });
    assert(data.assertions.length > 0, "request not found");
    const [assertion] = data.assertions;
    const assertionHash = assertion?.assertionHash;
    const assertionLogIndex = assertion?.assertionLogIndex;

    const assertionId = assertion?.id;
    const domainId = assertion?.domainId;
    const claim = assertion?.claim;
    const asserter = assertion?.asserter;
    const callbackRecipient = assertion?.callbackRecipient;
    const escalationManager = assertion?.escalationManager;
    const expirationTime = Number(assertion?.expirationTime);
    const caller = assertion?.caller;
    return {
      time,
      uniqueKey: assertionId,
      identifier,
      ooRequestUrl: constructOoUiLink(
        assertionHash,
        chainId,
        "OptimisticOracleV3",
        assertionLogIndex.toString()
      ),
      originatingChainTxHash: assertionHash,
      originatingChainId: chainId,
      originatingOracleType: "OptimisticOracleV3",
      optimisticOracleV3Data: {
        assertionId,
        domainId,
        claim,
        asserter,
        callbackRecipient,
        escalationManager,
        expirationTime,
        caller,
      },
    };
  } catch (error) {
    if (debug) console.error("oov3 error:", error);
    throw error;
  }
}
async function oov2Query({
  time,
  identifier,
  chainId,
}: OracleQueryParams): Promise<ResponseBody> {
  const subgraph = getSubgraphConfig("Optimistic Oracle V2", chainId);
  const query = gql`
    query oov2Query($proposalTimestamp: Int!) {
      optimisticPriceRequests(
        where: { proposalTimestamp: $proposalTimestamp }
      ) {
        id
        requestHash
        requestLogIndex
      }
    }
  `;
  type GqlRequest = {
    id: string;
    requestHash: string;
    requestLogIndex: string;
  };
  type GqlResponse = {
    optimisticPriceRequests: GqlRequest[];
  };

  try {
    const data: GqlResponse = await request(subgraph.url, query, {
      proposalTimestamp: time,
    });
    assert(data.optimisticPriceRequests.length > 0, "request not found");
    const [optimisticPriceRequest] = data.optimisticPriceRequests;
    const requestHash = optimisticPriceRequest.requestHash;
    const requestLogIndex = optimisticPriceRequest.requestLogIndex;
    const uniqueKey = optimisticPriceRequest.id;
    return {
      time,
      uniqueKey,
      identifier,
      ooRequestUrl: constructOoUiLink(
        requestHash,
        chainId,
        "OptimisticOracleV2",
        requestLogIndex
      ),
      originatingChainTxHash: requestHash,
      originatingChainId: chainId,
      originatingOracleType: "OptimisticOracleV2",
    };
  } catch (error) {
    if (debug) console.error("oov2 error:", error);
    throw error;
  }
}
async function oov1Query({
  time,
  identifier,
  chainId,
}: OracleQueryParams): Promise<ResponseBody> {
  const subgraph = getSubgraphConfig("Optimistic Oracle V1", chainId);
  const query = gql`
    query oov1Query($proposalTimestamp: Int!) {
      optimisticPriceRequests(
        where: { proposalTimestamp: $proposalTimestamp }
      ) {
        id
        requestHash
        requestLogIndex
        requestTimestamp
      }
    }
  `;
  type GqlRequest = {
    id: string;
    requestHash: string;
    requestLogIndex: string;
  };
  type GqlResponse = {
    optimisticPriceRequests: GqlRequest[];
  };

  try {
    const data: GqlResponse = await request(subgraph.url, query, {
      proposalTimestamp: time,
    });
    assert(data.optimisticPriceRequests.length > 0, "request not found");
    const [optimisticPriceRequest] = data.optimisticPriceRequests;
    const requestHash = optimisticPriceRequest?.requestHash;
    const requestLogIndex = optimisticPriceRequest?.requestLogIndex;
    const uniqueKey = optimisticPriceRequest?.id;
    return {
      time,
      uniqueKey,
      identifier,
      ooRequestUrl: constructOoUiLink(
        requestHash,
        chainId,
        "OptimisticOracle",
        requestLogIndex
      ),
      originatingChainTxHash: requestHash,
      originatingChainId: chainId,
      originatingOracleType: "OptimisticOracle",
    };
  } catch (error) {
    if (debug) console.error("oov1 error:", error);
    throw error;
  }
}
async function tryAllTypes(request: RequestBody): Promise<ResponseBody> {
  const chainId =
    extractChildChainId(decodeHexString(request.ancillaryData)) ?? 1;
  const results = await Promise.allSettled([
    oov1Query({ ...request, chainId }),
    oov2Query({ ...request, chainId }),
    oov3Query({ ...request, chainId }),
    ooSkinnyQuery({ ...request, chainId }),
  ]);
  const successResult: undefined | PromiseFulfilledResult<ResponseBody> =
    results.find(
      (result): result is PromiseFulfilledResult<ResponseBody> =>
        result.status === "fulfilled"
    );

  if (!successResult) {
    throw new Error("All requests failed");
  }

  return successResult?.value;
}

async function augmentRequest(request: RequestBody): Promise<ResponseBody> {
  const vote = await voteQuery(request);
  const l1RequestTxHash = vote?.requestTransaction;
  const result = await tryAllTypes(request);
  return {
    ...result,
    l1RequestTxHash,
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body: RequestBody = ss.create(request.body, RequestBody);
    if (debug) console.log(body);
    const result = await augmentRequest(body);
    if (debug) console.log(result);
    response.status(200).send(result);
  } catch (e) {
    if (debug) console.error("augment-request error:", e);
    response.status(500).send({
      message: "Error in fetching augmented information",
      error: e instanceof Error ? e.message : e,
    });
  }
}
