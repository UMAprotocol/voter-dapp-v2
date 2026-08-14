import { describe, it, expect, vi } from "vitest";

vi.mock("helpers/config", () => ({
  config: {},
  appConfig: {},
  env: {},
}));

import {
  checkIfIsPolymarket,
  getInitializer,
} from "helpers/voting/projects/polymarket";
import {
  POLYMARKET_ANCIL_DATA,
  POLYMARKET_SPOOFED_INITIALIZER_ANCIL_DATA,
} from "./constants";

// ooRequester and childChainId are appended by the contract, not present in raw ancillary data
const withPolymarketRequester = (ancillaryData: string) =>
  `${ancillaryData},ooRequester:2f5e3684cb1f318ec51b00edba38d79ac2c0aa9d,childChainId:137`;

// POLYMARKET_ANCIL_DATA already ends with this canonical initializer
const CANONICAL_INITIALIZER = "0x91430cad2d3975766499717fa0d66a78d814e5c5";
const NONCANONICAL_INITIALIZER = "0x0d14e9a9bb646ff0b23f610dd3a50fc9f40cd336";

describe("checkIfIsPolymarket", () => {
  describe("matches", () => {
    it("returns true for Polymarket ancillary data with requester and chainId", () => {
      expect(
        checkIfIsPolymarket(
          "YES_OR_NO_QUERY",
          withPolymarketRequester(POLYMARKET_ANCIL_DATA)
        )
      ).toBe(true);
    });

    it("returns true for MULTIPLE_VALUES identifier", () => {
      expect(
        checkIfIsPolymarket(
          "MULTIPLE_VALUES",
          withPolymarketRequester(POLYMARKET_ANCIL_DATA)
        )
      ).toBe(true);
    });
  });

  describe("non-matches", () => {
    it("returns false without ooRequester and childChainId", () => {
      expect(
        checkIfIsPolymarket("YES_OR_NO_QUERY", POLYMARKET_ANCIL_DATA)
      ).toBe(false);
    });

    it("returns false when identifier is unsupported", () => {
      expect(
        checkIfIsPolymarket(
          "SOME_OTHER_IDENTIFIER",
          withPolymarketRequester(POLYMARKET_ANCIL_DATA)
        )
      ).toBe(false);
    });

    it("returns false when a canonical initializer is followed by a non-canonical one", () => {
      // The adapter appends the true msg.sender last, so a canonical address
      // embedded earlier in the caller's own text must not win.
      expect(
        checkIfIsPolymarket(
          "YES_OR_NO_QUERY",
          POLYMARKET_SPOOFED_INITIALIZER_ANCIL_DATA
        )
      ).toBe(false);
    });

    it("returns false when the only initializer is non-canonical", () => {
      const ancillaryData = withPolymarketRequester(
        POLYMARKET_ANCIL_DATA.replace(
          CANONICAL_INITIALIZER.slice(2),
          NONCANONICAL_INITIALIZER.slice(2)
        )
      );

      expect(checkIfIsPolymarket("YES_OR_NO_QUERY", ancillaryData)).toBe(false);
    });
  });

  describe("initializer handling", () => {
    it("still matches when a non-canonical initializer is followed by a canonical one", () => {
      const ancillaryData = withPolymarketRequester(
        `${POLYMARKET_ANCIL_DATA.replace(
          CANONICAL_INITIALIZER.slice(2),
          NONCANONICAL_INITIALIZER.slice(2)
        )},initializer:${CANONICAL_INITIALIZER.slice(2)}`
      );

      expect(checkIfIsPolymarket("YES_OR_NO_QUERY", ancillaryData)).toBe(true);
    });

    it("keeps requester-only classification when no initializer is present", () => {
      // Legacy adapters never appended an initializer token.
      const ancillaryData = withPolymarketRequester(
        POLYMARKET_ANCIL_DATA.replace(
          `,initializer:${CANONICAL_INITIALIZER.slice(2)}`,
          ""
        )
      );

      expect(ancillaryData).not.toContain("initializer:");
      expect(checkIfIsPolymarket("YES_OR_NO_QUERY", ancillaryData)).toBe(true);
    });
  });
});

describe("getInitializer", () => {
  it("returns the last initializer when several are present", () => {
    expect(getInitializer(POLYMARKET_SPOOFED_INITIALIZER_ANCIL_DATA)).toBe(
      NONCANONICAL_INITIALIZER
    );
  });

  it("returns the only initializer when there is one", () => {
    expect(getInitializer(POLYMARKET_ANCIL_DATA)).toBe(CANONICAL_INITIALIZER);
  });

  it("returns undefined when there is no initializer token", () => {
    expect(getInitializer("q: title: no initializer here")).toBeUndefined();
  });

  it("ignores initializer tokens that are not 20-byte addresses", () => {
    expect(getInitializer("initializer:notanaddress")).toBeUndefined();
  });
});
