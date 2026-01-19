import { BigNumber, utils } from "ethers";

export function makeUniqueKeyForVote(
  decodedIdentifier: string,
  time: number | BigNumber,
  ancillaryData: string | null | undefined
) {
  if (typeof time !== "number") {
    time = time.toNumber();
  }
  const ancillaryDataHash = utils.keccak256(
    utils.toUtf8Bytes(ancillaryData ?? "")
  );
  return `${decodedIdentifier}-${time}-${ancillaryDataHash}`;
}
