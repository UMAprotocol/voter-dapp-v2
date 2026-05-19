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

  // Strip whitespace (incl. newlines) so a paste with a trailing space/newline
  // doesn't fail the regex below and silently drop the entire pasted value.
  value = value.replace(/\s+/g, "");

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
