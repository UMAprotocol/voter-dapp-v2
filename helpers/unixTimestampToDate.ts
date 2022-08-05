import { BigNumber } from "ethers";

export default function unixTimestampToDate(timestamp: BigNumber) {
  return new Date(timestamp.toNumber() * 1000);
}
