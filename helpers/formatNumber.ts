import { BigNumber } from "ethers";
import { commify, formatEther } from "helpers";

export function formatNumberForDisplay(number: BigNumber | undefined, decimals = 2) {
  if (!number) return "0";
  return truncateDecimals(commify(formatEther(number)), decimals);
}

export function truncateDecimals(number: string, decimals: number) {
  const [whole, decimal] = number.split(".");
  if (!decimal) return number;
  return `${whole}.${decimal.slice(0, decimals)}`;
}
