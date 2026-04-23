import { parseFixed } from "@ethersproject/bignumber";
import { maxInt256, minInt256 } from "constant/web3/numbers";
import { getPrecisionForIdentifier } from "helpers/web3/crypto";

export type CustomVoteInputValidation =
  | { isValid: true }
  | { isValid: false; message: string };

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
    const missingDecimal = !value.includes(".");
    const hint = missingDecimal
      ? ` Values are parsed with ${precision} decimals of precision — did you forget to include the decimal point? e.g. "1.5" is encoded as 1500000000000000000.`
      : "";
    return {
      isValid: false,
      message: `Value is out of range for a 256-bit signed integer.${hint}`,
    };
  }
  return { isValid: true };
}
