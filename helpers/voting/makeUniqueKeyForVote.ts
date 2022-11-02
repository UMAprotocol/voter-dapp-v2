import { BigNumber } from "ethers";

export function makeUniqueKeyForVote(
  decodedIdentifier: string,
  time: number | BigNumber,
  ancillaryData: string
) {
  if (typeof time !== "number") {
    time = time.toNumber();
  }
  return `${decodedIdentifier}-${time}-${ancillaryData}`;
}
