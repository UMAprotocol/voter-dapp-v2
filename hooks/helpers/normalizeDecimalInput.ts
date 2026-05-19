import { maximumApprovalAmountString } from "constant/misc/maximumApprovalAmountString";

export type NormalizeDecimalResult =
  | { kind: "accept"; value: string }
  | { kind: "reject" }
  | { kind: "tooManyDecimals" };

// Pure normalization of a decimal-style input. Extracted from
// useHandleDecimalInput so the paste/typing rules can be unit-tested in a
// Node environment without React context.
export function normalizeDecimalInput(
  rawValue: string,
  maxDecimals: number,
  allowNegative: boolean,
  type = "number"
): NormalizeDecimalResult {
  let value = rawValue;

  if (type !== "number") {
    return { kind: "accept", value };
  }

  if (value.includes(maximumApprovalAmountString)) {
    value = value.replace(maximumApprovalAmountString, "");
  }

  // Trim only leading/trailing whitespace so a paste with a trailing
  // newline/space doesn't fail the regex below and silently drop the entire
  // pasted value. Internal whitespace must still be rejected — e.g. "1 000"
  // in an amount field should NOT be silently coerced to 1000.
  value = value.trim();

  // Replace commas with periods for decimal handling
  value = value.replace(/,/g, ".");

  const negativeAllowedDecimalRegex = /^-?\d*\.?\d{0,}$/;
  const onlyPositiveDecimalsRegex = /^\d*\.?\d{0,}$/;
  const decimalsRegex = allowNegative
    ? negativeAllowedDecimalRegex
    : onlyPositiveDecimalsRegex;

  if (!decimalsRegex.test(value)) return { kind: "reject" };

  if (value.includes(".")) {
    const decimals = value.split(".")[1];
    if (decimals.length > maxDecimals) {
      return { kind: "tooManyDecimals" };
    }
  }

  return { kind: "accept", value };
}
