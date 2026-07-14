import { BigNumber, utils } from "ethers";

export function makeUniqueKeyForVote(
  decodedIdentifier: string,
  time: number | BigNumber,
  ancillaryData: string | null | undefined
) {
  if (typeof time !== "number") {
    time = time.toNumber();
  }
  const dataToHash =
    ancillaryData && ancillaryData !== "0x" ? ancillaryData : "0x";
  const ancillaryDataHash = utils.keccak256(dataToHash);
  return makeUniqueKeyFromAncillaryHash(
    decodedIdentifier,
    time,
    ancillaryDataHash
  );
}

// For callers that hold keccak256(ancillaryData) instead of the data itself.
// The votingV2 subgraph's PriceRequest.id shares this exact format, so every
// construction of it must live in this module.
export function makeUniqueKeyFromAncillaryHash(
  decodedIdentifier: string,
  time: number,
  ancillaryDataHash: string
) {
  return `${decodedIdentifier}-${time}-${ancillaryDataHash.toLowerCase()}`;
}
