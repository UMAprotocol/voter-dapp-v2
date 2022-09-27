import { PriceRequestByKeyT, PriceRequestT, RawPriceRequestDataT } from "types/global";
import { decodeHexString } from "./decodeHexString";
import { makeUniqueKeyForVote } from "./votes";

export function makePriceRequestsByKey(priceRequests: RawPriceRequestDataT[] | undefined) {
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
  return priceRequests.map(formatPriceRequest).filter((priceRequest): priceRequest is PriceRequestT => !!priceRequest);
}

function formatPriceRequest(priceRequest: RawPriceRequestDataT) {
  const time = Number(priceRequest.time);
  const timeMilliseconds = time * 1000;
  const timeAsDate = new Date(timeMilliseconds);
  const transactionHash = "0x5b80ae07dfec789436ce29ff8169907e6ad4dcf765244314fb3748d8c7042925";
  const identifier = priceRequest.identifier;
  const ancillaryData = priceRequest.ancillaryData;
  const decodedIdentifier = decodeHexString(identifier);
  const decodedAncillaryData = decodeHexString(ancillaryData);
  const correctVote = priceRequest.correctVote;
  const uniqueKey = makeUniqueKeyForVote(identifier, time, ancillaryData);

  return {
    time,
    identifier,
    ancillaryData,
    transactionHash,
    timeMilliseconds,
    timeAsDate,
    decodedIdentifier,
    decodedAncillaryData,
    correctVote,
    uniqueKey,
  } as PriceRequestT;
}
