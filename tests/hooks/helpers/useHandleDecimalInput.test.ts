import { describe, expect, it } from "vitest";
import { normalizeDecimalInput } from "hooks/helpers/normalizeDecimalInput";
import { earlyRequestMagicNumber } from "constant/voting/earlyRequestMagicNumber";

const MAX_DECIMALS_18 = 18;

describe("normalizeDecimalInput", () => {
  it("accepts the early request magic number when negatives are allowed", () => {
    expect(
      normalizeDecimalInput(earlyRequestMagicNumber, MAX_DECIMALS_18, true)
    ).toEqual({ kind: "accept", value: earlyRequestMagicNumber });
  });

  // The reported paste bug: copy from another app often appends \n or a space.
  // Before the trim fix the strict ^…$ regex failed and the entire value was
  // silently dropped, so the user saw the decimal portion "stripped".
  it("trims whitespace and newlines from a pasted magic number", () => {
    expect(
      normalizeDecimalInput(
        `  ${earlyRequestMagicNumber}\n`,
        MAX_DECIMALS_18,
        true
      )
    ).toEqual({ kind: "accept", value: earlyRequestMagicNumber });
  });

  it("rejects a negative value when allowNegative is false", () => {
    expect(
      normalizeDecimalInput(earlyRequestMagicNumber, MAX_DECIMALS_18, false)
    ).toEqual({ kind: "reject" });
  });

  it("flags too many decimals rather than accepting a truncated value", () => {
    expect(normalizeDecimalInput("1.123", 2, true)).toEqual({
      kind: "tooManyDecimals",
    });
  });

  // Guards against trimming internal whitespace: "1 000" must NOT be silently
  // accepted as 1000 in AmountInput (staking/unstaking) and similar fields.
  it("rejects internal whitespace rather than coercing the value", () => {
    expect(normalizeDecimalInput("1 000", MAX_DECIMALS_18, false)).toEqual({
      kind: "reject",
    });
  });

  it("passes raw text through when type is not number", () => {
    expect(normalizeDecimalInput("0xabc ", 0, false, "text")).toEqual({
      kind: "accept",
      value: "0xabc ",
    });
  });
});
