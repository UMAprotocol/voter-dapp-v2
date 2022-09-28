import { BigNumber } from "ethers";

export function unixTimestampToDate(timestamp: BigNumber) {
  return new Date(timestamp.toNumber() * 1000);
}
