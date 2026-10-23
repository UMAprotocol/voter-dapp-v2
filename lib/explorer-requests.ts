import * as ss from "superstruct";
import { keccak256 } from "ethers/lib/utils";
import { decodeHexString } from "helpers/web3/decodeHexString";
import { stripOoRequesterStamp } from "lib/deeplink-matching";

// The Explorer dapp's (https://explorer.uma.xyz) API. It indexes permissionless
// and managed OptimisticOracleV2 requests on Polygon mainnet only.
export const explorerApiUrl = "https://oracle.api.otb.uma.xyz";

const ExplorerRequestRound = ss.type({
  question_id: ss.string(),
  request_timestamp: ss.number(),
  requester: ss.string(),
  oracle_type: ss.string(),
  proposal_time: ss.nullable(ss.string()),
  proposed_price: ss.nullable(ss.string()),
  request_tx_hash: ss.nullable(ss.string()),
  request_event_index: ss.nullable(ss.number()),
});
export type ExplorerRequestRound = ss.Infer<typeof ExplorerRequestRound>;

const ExplorerRequestsResponse = ss.type({
  items: ss.array(ExplorerRequestRound),
});

// The explorer keys requests by question_id = keccak256(ancillary data as
// passed to the oracle), so the DVM-side ooRequester stamp has to come off.
export function explorerQuestionId(ancillaryDataL2: string) {
  return keccak256(stripOoRequesterStamp(ancillaryDataL2) ?? ancillaryDataL2);
}

export function extractOoRequester(ancillaryDataL2: string) {
  const match = decodeHexString(ancillaryDataL2).match(
    /,ooRequester:([a-f0-9]{40})/i
  );
  return match ? `0x${match[1].toLowerCase()}` : undefined;
}

// All rounds for a question. A question gets a new round each time its
// requester re-requests it (e.g. Polymarket after a dispute).
export async function getExplorerRequestRounds(
  questionId: string
): Promise<ExplorerRequestRound[]> {
  const params = new URLSearchParams({
    q: questionId,
    include_polymarket_v2: "true",
    page_size: "500",
  });
  const response = await fetch(
    `${explorerApiUrl}/requests?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error(`Explorer API responded with ${response.status}`);
  }
  return ss.create(await response.json(), ExplorerRequestsResponse).items;
}

// A DVM request's time is the OO request time, or the proposal time for
// event-based requests, so either can identify the round that was disputed.
export function findRoundForDvmTime(
  rounds: ExplorerRequestRound[],
  time: number
) {
  const exact = rounds.find(
    (round) =>
      round.request_timestamp === time ||
      (round.proposal_time !== null &&
        Date.parse(round.proposal_time) / 1000 === time)
  );
  if (exact) return exact;
  return rounds.length === 1 ? rounds[0] : undefined;
}
