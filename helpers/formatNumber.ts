import { BigNumber } from "ethers";
import { commify, formatEther, parseEther } from "helpers";

export function formatNumberForDisplay(value: number | string, decimals = 2) {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  return commify(value.toFixed(decimals));
}

export function formatBigNumberForDisplay(
  number: BigNumber | undefined,
  options?: { decimals?: number; isFormatEther?: boolean }
) {
  if (!number) return "0";
  const { decimals = 2, isFormatEther = true } = options || {};
  const _number = isFormatEther ? formatEther(number) : number.toString();
  return truncateDecimals(commify(_number), decimals);
}

export function truncateDecimals(number: string, decimals: number) {
  const [whole, decimal] = number.split(".");
  if (!decimal) return number;
  if (decimals === 0) return whole.toString();
  return `${whole}.${decimal.slice(0, decimals)}`;
}

export function bigNumberFromFloatString(value: string) {
  const truncated = truncateDecimals(value, 18);
  return BigNumber.from(parseEther(truncated));
}
