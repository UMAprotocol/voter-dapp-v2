import { PriceRequestByKeyT, PriceRequestT, RawPriceRequestDataT } from "types";
import { decodeHexString } from "helpers";
import { makeUniqueKeyForVote } from "helpers";

export function makePriceRequestsByKey(
  priceRequests: RawPriceRequestDataT[] | undefined
) {
  const priceRequestsByKey: PriceRequestByKeyT = {};

  if (priceRequests?.length) {
    const formattedPriceRequests = formatPriceRequests(priceRequests);
    formattedPriceRequests?.forEach((priceRequest) => {
      priceRequestsByKey[priceRequest.uniqueKey] = priceRequest;
    });
  }

  return priceRequestsByKey;
}

function formatPriceRequests(priceRequests: RawPriceRequestDataT[]) {
  return priceRequests
    .map(formatPriceRequest)
    .filter((priceRequest): priceRequest is PriceRequestT => !!priceRequest);
}

function formatPriceRequest(priceRequest: RawPriceRequestDataT) {
  const time = Number(priceRequest.time);
  const timeMilliseconds = time * 1000;
  const timeAsDate = new Date(timeMilliseconds);
  const identifier = priceRequest.identifier;
  const ancillaryData = priceRequest.ancillaryData;
  const voteNumber = priceRequest.priceRequestIndex;
  const decodedIdentifier = decodeHexString(identifier);
  let decodedAncillaryData = ancillaryData;
  try {
    // this will fail expecially with data from previous contracts. So catch and warn.
    decodedAncillaryData = decodeHexString(ancillaryData);
  } catch (err) {
    console.warn(
      "unable to format price request, ancillary data decode failed:",
      err,
      priceRequest
    );
  }
  const correctVote = priceRequest.correctVote;
  const uniqueKey = makeUniqueKeyForVote(
    decodedIdentifier,
    time,
    ancillaryData
  );
  const isV1 = priceRequest.isV1;

  return {
    time,
    identifier,
    ancillaryData,
    voteNumber,
    timeMilliseconds,
    timeAsDate,
    decodedIdentifier,
    decodedAncillaryData,
    correctVote,
    uniqueKey,
    isV1,
  } as PriceRequestT;
}
