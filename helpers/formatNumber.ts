import { BigNumber, FixedNumber } from "ethers";
import { commify, formatEther } from "helpers";

export function formatNumberForDisplay(
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
  return `${whole}.${decimal.slice(0, decimals)}`;
}

export function bigNumberFromDecimal(decimal: string | number) {
  if (typeof decimal === "number") {
    decimal = decimal.toFixed(18);
  }
  return BigNumber.from(FixedNumber.from(truncateDecimals(decimal, 18)));
}
