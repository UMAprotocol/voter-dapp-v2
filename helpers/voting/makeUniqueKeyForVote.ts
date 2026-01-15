import { BigNumber, utils } from "ethers";

export function makeUniqueKeyForVote(
  decodedIdentifier: string,
  time: number | BigNumber,
  ancillaryData: string
) {
  if (typeof time !== "number") {
    time = time.toNumber();
  }
  return utils.keccak256(
    utils.toUtf8Bytes(`${decodedIdentifier}-${time}-${ancillaryData}`)
  );
}
