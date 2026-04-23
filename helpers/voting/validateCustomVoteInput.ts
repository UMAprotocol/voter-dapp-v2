import { formatFixed, parseFixed } from "@ethersproject/bignumber";
import { BigNumber } from "ethers";
import { maxInt256, minInt256 } from "constant/web3/numbers";
import { getPrecisionForIdentifier } from "helpers/web3/crypto";

export type CustomVoteInputValidation =
  | { isValid: true }
  | { isValid: false; message: string; suggestion?: string };

function suggestUnscaledValue(
  value: string,
  precision: number
): string | undefined {
  if (value.includes(".")) return undefined;
  try {
    const asInt = BigNumber.from(value);
    if (asInt.gt(maxInt256) || asInt.lt(minInt256)) return undefined;
    return formatFixed(asInt, precision);
  } catch {
    return undefined;
  }
}

export function validateCustomVoteInput(
  value: string | undefined,
  decodedIdentifier: string
): CustomVoteInputValidation {
  if (!value || value === "-" || value === ".") return { isValid: true };
  if (decodedIdentifier === "MULTIPLE_VALUES") return { isValid: true };

  const precision = getPrecisionForIdentifier(decodedIdentifier);

  let parsed;
  try {
    parsed = parseFixed(value, precision);
  } catch {
    return { isValid: false, message: "Invalid number." };
  }

  if (parsed.gt(maxInt256) || parsed.lt(minInt256)) {
    const suggestion = suggestUnscaledValue(value, precision);
    const umipRule = `Per UMIP-107, enter unscaled decimal values — the interface scales by 10^${precision} for you.`;
    if (suggestion) {
      return {
        isValid: false,
        message: `This looks like a pre-scaled value. ${umipRule} Did you mean ${suggestion}?`,
        suggestion,
      };
    }
    return {
      isValid: false,
      message: `Value is out of range for a 256-bit signed integer. ${umipRule}`,
    };
  }
  return { isValid: true };
}
