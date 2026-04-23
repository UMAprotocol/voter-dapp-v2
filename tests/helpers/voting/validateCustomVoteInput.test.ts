import { describe, expect, it, vi } from "vitest";

vi.mock("helpers/config", () => ({
  config: {},
  appConfig: {},
  env: {},
}));

vi.mock("helpers/web3/initOnboard", () => ({
  initOnboard: () => undefined,
}));

import { validateCustomVoteInput } from "helpers/voting/validateCustomVoteInput";

const NUMERIC_ID = "YES_OR_NO_QUERY";
const MIN_INT_256_DECIMAL =
  "-57896044618658097711785492504343953926634992332820282019728.792003956564819968";
const MAX_INT_256_DECIMAL =
  "57896044618658097711785492504343953926634992332820282019728.792003956564819967";
const OVERFLOW_NO_DECIMAL =
  "-57896044618658097711785492504343953926634992332820282019728792003956564819968";

describe("validateCustomVoteInput", () => {
  it("treats empty / partial inputs as valid", () => {
    expect(validateCustomVoteInput("", NUMERIC_ID)).toEqual({ isValid: true });
    expect(validateCustomVoteInput(undefined, NUMERIC_ID)).toEqual({
      isValid: true,
    });
    expect(validateCustomVoteInput("-", NUMERIC_ID)).toEqual({ isValid: true });
    expect(validateCustomVoteInput(".", NUMERIC_ID)).toEqual({ isValid: true });
  });

  it("accepts well-formed decimal values inside int256 bounds", () => {
    expect(validateCustomVoteInput("1.5", NUMERIC_ID)).toEqual({
      isValid: true,
    });
    expect(validateCustomVoteInput("-42", NUMERIC_ID)).toEqual({
      isValid: true,
    });
  });

  it("accepts exact minInt256 and maxInt256 boundary values", () => {
    expect(validateCustomVoteInput(MIN_INT_256_DECIMAL, NUMERIC_ID)).toEqual({
      isValid: true,
    });
    expect(validateCustomVoteInput(MAX_INT_256_DECIMAL, NUMERIC_ID)).toEqual({
      isValid: true,
    });
  });

  it("rejects out-of-range values entered without a decimal point and suggests the decimal", () => {
    const result = validateCustomVoteInput(OVERFLOW_NO_DECIMAL, NUMERIC_ID);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.message).toMatch(/out of range/i);
      expect(result.message).toMatch(/decimal point/i);
      expect(result.message).toMatch(/18 decimals of precision/);
    }
  });

  it("rejects out-of-range values that already include a decimal without the missing-decimal hint", () => {
    const tooLargeWithDecimal =
      "99999999999999999999999999999999999999999999999999999999999.0";
    const result = validateCustomVoteInput(tooLargeWithDecimal, NUMERIC_ID);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.message).toMatch(/out of range/i);
      expect(result.message).not.toMatch(/decimal point/i);
    }
  });

  it("rejects non-numeric garbage", () => {
    expect(validateCustomVoteInput("abc", NUMERIC_ID)).toEqual({
      isValid: false,
      message: "Invalid number.",
    });
  });

  it("bypasses validation for MULTIPLE_VALUES identifier", () => {
    expect(
      validateCustomVoteInput(OVERFLOW_NO_DECIMAL, "MULTIPLE_VALUES")
    ).toEqual({ isValid: true });
  });

  it("uses non-18 precision when configured for the identifier", () => {
    const max6 =
      "57896044618658097711785492504343953926634992332820282019728792003956564.819967";
    expect(validateCustomVoteInput(max6, "STABLESPREAD/USDC").isValid).toBe(
      true
    );
  });
});
