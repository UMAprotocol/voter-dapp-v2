import { BigNumber } from "ethers";
import { commify, formatEther, parseEther } from "helpers";

export function formatNumberForDisplay(
  number: BigNumber | undefined,
  options?: { decimals?: number; isFormatEther?: boolean }
) {
  if (!number) return "0.0";
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

export function bigNumberFromFloatString(value: string | undefined) {
  if (!value) return BigNumber.from(0);
  const truncated = truncateDecimals(value, 18);
  return BigNumber.from(parseEther(truncated));
}