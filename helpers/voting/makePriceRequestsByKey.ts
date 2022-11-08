import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { PriceRequestByKeyT, PriceRequestT, RawPriceRequestDataT } from "types";

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
  let decodedIdentifier = "";
  let decodedAncillaryData = "";
  try {
    decodedIdentifier = decodeHexString(identifier);
  } catch (e) {
    decodedIdentifier = "WARNING - INVALID IDENTIFIER";
  }
  try {
    decodedAncillaryData = decodeHexString(ancillaryData);
  } catch (e) {
    decodedAncillaryData = `The ancillary data for this request is malformed and could not be decoded. Raw ancillary data: ${ancillaryData}`;
  }
  const correctVote = priceRequest.correctVote;
  const participation = priceRequest.participation;
  const results = priceRequest.results;
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
    participation,
    results,
    uniqueKey,
    isV1,
  } as PriceRequestT;
}
