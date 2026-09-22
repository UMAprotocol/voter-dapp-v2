import { makeBlockExplorerLink } from "helpers/util/misc";
import { decodeHexString } from "helpers/web3/decodeHexString";
import { extractMaybeAncillaryDataFields } from "lib/deeplink-matching";
import { createRequestHash, fetchBridgedEventsAt } from "lib/l2-ancillary-data";
import { parseQuestionAncillaryData } from "lib/question-ancillary-data";
import { PriceRequestT, RawDiscordMessageT } from "types";

type Request = Pick<
  PriceRequestT,
  "identifier" | "time" | "ancillaryData" | "decodedAncillaryData"
>;

export async function matchesLegacyQuestionThread(
  request: Request,
  messages: RawDiscordMessageT[]
): Promise<boolean> {
  if (!parseQuestionAncillaryData(request.decodedAncillaryData)) return false;

  const { childOracle, childChainId, childBlockNumber } =
    extractMaybeAncillaryDataFields(decodeHexString(request.ancillaryData));
  if (!childOracle || !childChainId || !childBlockNumber) return false;

  const events = await fetchBridgedEventsAt({
    childOracle: `0x${childOracle}`,
    childChainId: Number(childChainId),
    childBlockNumber: Number(childBlockNumber),
  });
  const parentRequestId = createRequestHash({
    ...request,
    time: String(request.time),
  });
  const event = events.find(
    (event) => event.args?.parentRequestId.toLowerCase() === parentRequestId
  );
  if (!event) return false;

  // The old N/A name identifies only a timestamp. A transaction containing
  // several requests at that timestamp cannot identify which thread is ours.
  const sameTransactionRequests = events.filter(
    (other) =>
      other.transactionHash === event.transactionHash &&
      other.args?.time.toString() === String(request.time)
  );
  if (sameTransactionRequests.length !== 1) return false;

  const url = makeBlockExplorerLink(
    event.transactionHash,
    Number(childChainId),
    "tx"
  );
  const firstMessage = messages.reduce<RawDiscordMessageT | undefined>(
    (first, message) =>
      !first || BigInt(message.id) < BigInt(first.id) ? message : first,
    undefined
  );
  return Boolean(
    url &&
      firstMessage?.content
        .split("\n")
        .some((line) => line.trim() === `**Transaction:** ${url}`)
  );
}
