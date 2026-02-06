// Probable Adapter

import { getChildChainId, getRequester } from "./polymarket";

const probableAdapter = "0xa68F6B97f605f22ba6A8420460dafB5B5BC35A20";

export const probableRequesters = [probableAdapter.toLowerCase()];

export function isProbableRequester(address: string): boolean {
  return probableRequesters.includes(address.toLowerCase());
}

const polygonChainId = 137;

export function checkIfIsProbable(
  decodedIdentifier: string,
  decodedAncillaryData: string
) {
  const requester = getRequester(decodedAncillaryData);
  const childChainId = getChildChainId(decodedAncillaryData);
  const isProbable =
    decodedIdentifier === "YES_OR_NO_QUERY" &&
    requester &&
    isProbableRequester(requester) &&
    childChainId === polygonChainId;

  return isProbable;
}
