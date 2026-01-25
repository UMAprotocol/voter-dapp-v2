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
  return `${decodedIdentifier}-${time}-${ancillaryDataHash}`;
}
