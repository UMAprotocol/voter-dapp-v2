import { describe, it, expect, vi } from "vitest";
import { ethers } from "ethers";

vi.mock("helpers/config", () => ({
  config: {},
  appConfig: {},
  env: {},
}));

// formatVotes imports from the "helpers" barrel which triggers WalletConnect init.
// Mock it, forwarding only what formatProposedAnswer uses. The other imports
// (encryptMessage etc.) are stubbed — importing their real modules here would
// deadlock, because they import the mocked "helpers" barrel themselves.
vi.mock("helpers", async () => {
  const polymarket = await import("helpers/voting/projects/polymarket");
  return {
    decodeMultipleQuery: polymarket.decodeMultipleQuery,
    encryptMessage: vi.fn(),
    getPrecisionForIdentifier: () => 18,
    getRandomSignedInt: vi.fn(),
    solidityKeccak256: vi.fn(),
  };
});

import { formatProposedAnswer } from "helpers/voting/formatVotes";
import { encodeMultipleQuery } from "helpers/voting/projects/polymarket";
import { earlyRequestMagicNumber } from "constant/voting/earlyRequestMagicNumber";

const yesOrNoOptions = [
  { label: "No", value: "0", secondaryLabel: "p1" },
  { label: "Yes", value: "1", secondaryLabel: "p2" },
  { label: "Unknown", value: "0.5", secondaryLabel: "p3" },
  {
    label: "Early request",
    value: earlyRequestMagicNumber,
    secondaryLabel: "p4",
  },
  { label: "Custom", value: "custom" },
];

const oneEther = ethers.utils.parseEther("1").toString();
const halfEther = ethers.utils.parseEther("0.5").toString();

describe("formatProposedAnswer", () => {
  it("returns undefined when there is no proposed price", () => {
    expect(
      formatProposedAnswer(undefined, "YES_OR_NO_QUERY", yesOrNoOptions)
    ).toBeUndefined();
  });

  it("formats yes/no options with p-labels", () => {
    expect(
      formatProposedAnswer(oneEther, "YES_OR_NO_QUERY", yesOrNoOptions)
    ).toBe("P2 (Yes)");
    expect(formatProposedAnswer("0", "YES_OR_NO_QUERY", yesOrNoOptions)).toBe(
      "P1 (No)"
    );
    expect(
      formatProposedAnswer(halfEther, "YES_OR_NO_QUERY", yesOrNoOptions)
    ).toBe("P3 (Unknown)");
  });

  it("formats dynamic market outcome labels", () => {
    const options = [
      { label: "Zimbabwe", value: "1", secondaryLabel: "p2" },
      { label: "Zambia", value: "0", secondaryLabel: "p1" },
    ];
    expect(formatProposedAnswer(oneEther, "YES_OR_NO_QUERY", options)).toBe(
      "P2 (Zimbabwe)"
    );
  });

  it("formats the early request magic number via the p4 option", () => {
    expect(
      formatProposedAnswer(
        ethers.constants.MinInt256.toString(),
        "YES_OR_NO_QUERY",
        yesOrNoOptions
      )
    ).toBe("P4 (Early request)");
  });

  it("falls back to friendly names for magic numbers without options", () => {
    expect(
      formatProposedAnswer(
        ethers.constants.MinInt256.toString(),
        "YES_OR_NO_QUERY",
        undefined
      )
    ).toBe("Early request");
    expect(
      formatProposedAnswer(
        ethers.constants.MaxInt256.toString(),
        "YES_OR_NO_QUERY",
        undefined
      )
    ).toBe("Unresolvable");
  });

  it("uses the bare label when the option has no p-style secondary label", () => {
    const options = [{ label: "Valid", value: "1", secondaryLabel: "valid" }];
    expect(formatProposedAnswer(oneEther, "YES_OR_NO_QUERY", options)).toBe(
      "Valid"
    );
  });

  it("falls back to the plain number when no option matches", () => {
    expect(
      formatProposedAnswer(
        ethers.utils.parseEther("0.75").toString(),
        "YES_OR_NO_QUERY",
        yesOrNoOptions
      )
    ).toBe("0.75");
  });

  it("decodes MULTIPLE_VALUES prices into label/value pairs", () => {
    const options = [
      { label: "Lakers", value: "0" },
      { label: "Celtics", value: "1" },
    ];
    const encoded = encodeMultipleQuery(["102", "99"]);
    expect(formatProposedAnswer(encoded, "MULTIPLE_VALUES", options)).toBe(
      "Lakers: 102, Celtics: 99"
    );
  });

  it("handles magic numbers for MULTIPLE_VALUES", () => {
    expect(
      formatProposedAnswer(
        ethers.constants.MinInt256.toString(),
        "MULTIPLE_VALUES",
        []
      )
    ).toBe("Early request");
    expect(
      formatProposedAnswer(
        ethers.constants.MaxInt256.toString(),
        "MULTIPLE_VALUES",
        []
      )
    ).toBe("Unresolvable");
  });
});
