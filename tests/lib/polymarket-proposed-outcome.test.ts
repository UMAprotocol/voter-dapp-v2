import { describe, expect, it } from "vitest";
import { formatPolymarketProposedOutcome } from "lib/polymarket-proposed-outcome";
import { earlyRequestMagicNumberWei } from "constant/voting/earlyRequestMagicNumber";

const options = [
  { label: "No", value: "0" },
  { label: "Yes", value: "1" },
  { label: "unknown/50-50", value: "0.5" },
];

describe("originally proposed Polymarket outcome", () => {
  it.each([
    ["0", "No (0)"],
    ["1000000000000000000", "Yes (1)"],
    ["500000000000000000", "unknown/50-50 (0.5)"],
    [earlyRequestMagicNumberWei, "Early request"],
    [undefined, undefined],
    ["", undefined],
    ["invalid", undefined],
  ])("formats %s without inventing a missing outcome", (price, expected) => {
    expect(formatPolymarketProposedOutcome(price, options)).toBe(expected);
  });

  it("uses the request's labels instead of assuming binary mappings", () => {
    expect(
      formatPolymarketProposedOutcome("0", [{ label: "Away", value: "0" }])
    ).toBe("Away (0)");
  });

  it("preserves numerical values without guessing atomic outcome labels", () => {
    expect(
      formatPolymarketProposedOutcome("3000000000000000000", undefined)
    ).toBe("3");
    expect(
      formatPolymarketProposedOutcome("-1250000000000000000", undefined)
    ).toBe("-1.25");
  });
});
