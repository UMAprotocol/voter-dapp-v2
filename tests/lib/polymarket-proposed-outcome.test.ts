import { describe, expect, it } from "vitest";
import { formatPolymarketProposedOutcome } from "lib/polymarket-proposed-outcome";
import { earlyRequestMagicNumberWei } from "constant/voting/earlyRequestMagicNumber";

const options = [
  { label: "No", value: "0", secondaryLabel: "p1" },
  { label: "Yes", value: "1", secondaryLabel: "p2" },
  { label: "unknown/50-50", value: "0.5", secondaryLabel: "p3" },
];

describe("originally proposed Polymarket outcome", () => {
  it.each([
    ["0", "P1 (No)"],
    ["1000000000000000000", "P2 (Yes)"],
    ["500000000000000000", "P3 (50/50)"],
    [earlyRequestMagicNumberWei, "Early request"],
    [undefined, undefined],
    ["", undefined],
    ["invalid", undefined],
  ])("formats %s without inventing a missing outcome", (price, expected) => {
    expect(formatPolymarketProposedOutcome(price, options)).toEqual(expected);
  });

  it("uses the request's labels instead of assuming binary mappings", () => {
    expect(
      formatPolymarketProposedOutcome("0", [{ label: "Away", value: "0" }])
    ).toEqual("Away");
  });

  it("uses the declared P-code even when values have a different order", () => {
    const rangeOptions = [
      { label: "Over", value: "0", secondaryLabel: "p2" },
      { label: "Under", value: "1", secondaryLabel: "p1" },
    ];
    expect(formatPolymarketProposedOutcome("0", rangeOptions)).toBe(
      "P2 (Over)"
    );
    expect(
      formatPolymarketProposedOutcome("1000000000000000000", rangeOptions)
    ).toBe("P1 (Under)");
  });

  it("preserves numerical values without guessing atomic outcome labels", () => {
    expect(
      formatPolymarketProposedOutcome("3000000000000000000", undefined)
    ).toEqual("3");
    expect(
      formatPolymarketProposedOutcome("-1250000000000000000", undefined)
    ).toEqual("-1.25");
  });
});
