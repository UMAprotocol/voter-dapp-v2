import { PriceRequestByKeyT, RawPriceRequestDataT } from "types/global";
import { decodeHexString } from "./decodeHexString";
import { makeUniqueKeyForVote } from "./votes";

export default function makePriceRequestsByKey(priceRequests: RawPriceRequestDataT[] | undefined) {
  const result: PriceRequestByKeyT = {};
  priceRequests?.forEach(({ time, identifier, ancillaryData }) => {
    result[makeUniqueKeyForVote(identifier, time.toNumber(), ancillaryData)] = {
      time: time.toNumber(),
      identifier,
      ancillaryData,
      // todo: replace with on chain value once getter is updated
      transactionHash: "0x5b80ae07dfec789436ce29ff8169907e6ad4dcf765244314fb3748d8c7042925",
      timeMilliseconds: time.toNumber() * 1000,
      timeAsDate: new Date(time.toNumber() * 1000),
      decodedIdentifier: decodeHexString(identifier),
      decodedAncillaryData: decodeHexString(ancillaryData),
      uniqueKey: makeUniqueKeyForVote(identifier, time.toNumber(), ancillaryData),
    };
  });
  return result;
}
