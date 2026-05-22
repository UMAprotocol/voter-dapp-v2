import { describe, it, expect, vi } from "vitest";

vi.mock("helpers/config", () => ({
  config: {},
  appConfig: {},
  env: {},
}));

import {
  checkIfIsPolymarket,
  resolveBulletinOwner,
} from "helpers/voting/projects/polymarket";
import { POLYMARKET_ANCIL_DATA } from "./constants";

// ooRequester and childChainId are appended by the contract, not present in raw ancillary data
const withPolymarketRequester = (ancillaryData: string) =>
  `${ancillaryData},ooRequester:2f5e3684cb1f318ec51b00edba38d79ac2c0aa9d,childChainId:137`;

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
  });
});

describe("resolveBulletinOwner", () => {
  const deprecated = "0x91430cad2d3975766499717fa0d66a78d814e5c5";
  const replacement = "0xf43d55f3a8b7484ed4b6931f93cb6f9ef5dd369d";

  it("remaps the deprecated initializer to the new owner", () => {
    expect(resolveBulletinOwner(deprecated)).toBe(replacement);
  });

  it("remaps regardless of address casing", () => {
    expect(resolveBulletinOwner(deprecated.toUpperCase())).toBe(replacement);
  });

  it("returns the input unchanged when no remap is configured", () => {
    const other = "0x1111111111111111111111111111111111111111";
    expect(resolveBulletinOwner(other)).toBe(other);
  });
});
