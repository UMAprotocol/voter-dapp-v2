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

  // Strip trailing whitespace only. The reported paste bug is the OS/source
  // app appending a newline or space at the end; leaving that in fails the
  // strict regex and silently drops the entire value.
  //
  // We intentionally do NOT strip leading whitespace, because TextInput sets
  // maxLength to exactly the length of values like earlyRequestMagicNumber.
  // If leading whitespace pushes a max-length paste past that limit, the
  // browser truncates significant digits off the END, and trimming the
  // leading spaces afterward would yield a regex-valid but semantically
  // wrong value (a different vote!). Rejecting is safer.
  //
  // Internal whitespace is also intentionally not stripped — "1 000" in an
  // amount field must NOT be silently coerced to 1000.
  value = value.replace(/\s+$/, "");

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
