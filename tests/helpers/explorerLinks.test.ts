import {
  constructExplorerRequestLink,
  isExplorerSupportedRequest,
} from "helpers/util/explorerLinks";
import { describe, expect, it } from "vitest";

const txHash =
  "0x1371bc0385e17a7c46de8efb48297a7a194d04f6a3b9c451b2c4fe0b84558842";

// Polygon mainnet OptimisticOracleV2 / ManagedOptimisticOracleV2 are the only
// requests the explorer indexes; everything else must produce no link so the
// vote panel renders nothing rather than a dead end.
describe("isExplorerSupportedRequest", () => {
  it("accepts Polygon OptimisticOracleV2 and ManagedOptimisticOracleV2", () => {
    expect(isExplorerSupportedRequest(137, "OptimisticOracleV2")).toBe(true);
    expect(isExplorerSupportedRequest("137", "ManagedOptimisticOracleV2")).toBe(
      true
    );
  });

  it("rejects oracle types the explorer has no page for", () => {
    expect(isExplorerSupportedRequest(137, "OptimisticOracle")).toBe(false);
    expect(isExplorerSupportedRequest(137, "SkinnyOptimisticOracle")).toBe(
      false
    );
    expect(isExplorerSupportedRequest(137, "OptimisticOracleV3")).toBe(false);
  });

  it("rejects chains the explorer does not index", () => {
    for (const chainId of [1, 10, 8453, 42161, 81457, 1514, 11155111, 80002]) {
      expect(isExplorerSupportedRequest(chainId, "OptimisticOracleV2")).toBe(
        false
      );
    }
  });

  it("rejects missing or malformed input", () => {
    expect(isExplorerSupportedRequest(undefined, "OptimisticOracleV2")).toBe(
      false
    );
    expect(isExplorerSupportedRequest(137, undefined)).toBe(false);
    expect(isExplorerSupportedRequest("polygon", "OptimisticOracleV2")).toBe(
      false
    );
  });
});

describe("constructExplorerRequestLink", () => {
  it("builds a /requests deep link with transactionHash and eventIndex", () => {
    expect(
      constructExplorerRequestLink(txHash, 137, "OptimisticOracleV2", "90")
    ).toBe(
      `https://explorer.uma.xyz/requests?transactionHash=${txHash}&eventIndex=90`
    );
  });

  it("omits eventIndex when it is not available", () => {
    // The explorer resolves a transaction that produced a single request
    // without an event index, and falls back to a filtered list when the hash
    // is ambiguous.
    expect(
      constructExplorerRequestLink(txHash, 137, "ManagedOptimisticOracleV2")
    ).toBe(`https://explorer.uma.xyz/requests?transactionHash=${txHash}`);
    expect(
      constructExplorerRequestLink(txHash, 137, "OptimisticOracleV2", "")
    ).toBe(`https://explorer.uma.xyz/requests?transactionHash=${txHash}`);
  });

  it("returns undefined for requests outside explorer coverage", () => {
    expect(
      constructExplorerRequestLink(txHash, 1, "OptimisticOracleV2", "0")
    ).toBeUndefined();
    expect(
      constructExplorerRequestLink(txHash, 137, "OptimisticOracleV3", "0")
    ).toBeUndefined();
  });

  it("returns undefined without a transaction hash", () => {
    expect(
      constructExplorerRequestLink(undefined, 137, "OptimisticOracleV2", "0")
    ).toBeUndefined();
  });
});
