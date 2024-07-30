import { BigNumber } from "ethers";
import { commify, formatEther, parseEther } from "helpers";

export function formatNumberForDisplay(
  number: BigNumber | undefined,
  options?: { decimals?: number; isFormatEther?: boolean }
) {
  if (!number) return "0";
  const { decimals = 2, isFormatEther = true } = options || {};
  const _number = isFormatEther ? formatEther(number) : number.toString();
  return truncateDecimals(commify(_number), decimals);
}

export function truncateDecimals(number: string | number, decimals: number) {
  const [whole, decimal] = number.toString().split(".");
  if (!decimal) return number.toString();
  if (decimals === 0) return whole.toString();
  const truncated = decimal.slice(0, decimals);
  // if the truncated value is just 0, return the whole number
  if (Number(truncated) === 0) return whole.toString();
  return `${whole}.${truncated}`;
}

export function bigNumberFromFloatString(value: string | undefined) {
  if (!value) return BigNumber.from(0);
  const truncated = truncateDecimals(value, 18);
  return BigNumber.from(parseEther(truncated));
}

/**
 * Formats a number to its most significant thousand, returning a string with the appropriate suffix (k for thousand, M for million, B for billion, etc.).
 *
 * @param {number} num - The number to be formatted.
 * @returns {string} The formatted number with a suffix representing the scale (k, M, B, etc.).
 *
 * @example
 * formatNumber(1200000); // Returns "1.2M"
 *
 * @example
 * formatNumber(13000); // Returns "13k"
 */
export function formatToSignificantThousand(
  num: number,
  precision?: number
): string {
  const SI_SYMBOL = ["", "k", "M", "B", "T"];

  const decimals = precision ?? 1;

  // Determine the tier
  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);

  // If the number is less than 1000, return the number as is
  if (tier === 0) return num.toString();

  // Get the suffix from SI_SYMBOL array
  const suffix = SI_SYMBOL[tier];

  // Scale the number
  const scale = Math.pow(10, tier * 3);

  // Format the number
  const scaledNumber = num / scale;

  // Round to 1 decimal place if necessary
  const formattedNumber = scaledNumber.toFixed(decimals);

  // Remove unnecessary trailing zeroes and decimal point
  const cleanNumber = parseFloat(formattedNumber).toLocaleString();

  return `${cleanNumber}${suffix}`;
}
