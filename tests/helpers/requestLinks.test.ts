import {
  buildRequestLink,
  constructExplorerRequestLink,
  constructOracleDappRequestLink,
  isExplorerRequestLink,
  isExplorerSupportedRequest,
} from "helpers/util/requestLinks";
import { describe, expect, it } from "vitest";

const txHash =
  "0x1371bc0385e17a7c46de8efb48297a7a194d04f6a3b9c451b2c4fe0b84558842";

// Polygon mainnet OptimisticOracleV2 / ManagedOptimisticOracleV2 are the only
// requests the explorer serves. Everything else keeps its oracle dapp link.
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

  it("returns undefined outside explorer coverage", () => {
    expect(
      constructExplorerRequestLink(txHash, 1, "OptimisticOracleV2", "0")
    ).toBeUndefined();
    expect(
      constructExplorerRequestLink(txHash, 137, "OptimisticOracleV3", "0")
    ).toBeUndefined();
  });
});

describe("constructOracleDappRequestLink", () => {
  it("builds the oracle dapp link", () => {
    expect(
      constructOracleDappRequestLink(txHash, 1, "OptimisticOracleV3", "4")
    ).toBe(
      `https://oracle.uma.xyz/request?transactionHash=${txHash}&chainId=1&oracleType=OptimisticV3&eventIndex=4`
    );
  });

  it("uses the testnet subdomain on testnet deployments", () => {
    expect(
      constructOracleDappRequestLink(
        txHash,
        11155111,
        "OptimisticOracleV2",
        "4",
        true
      )
    ).toBe(
      `https://testnet.oracle.uma.xyz/request?transactionHash=${txHash}&chainId=11155111&oracleType=OptimisticV2&eventIndex=4`
    );
  });

  it("returns undefined for unsupported chains and missing input", () => {
    expect(
      constructOracleDappRequestLink(txHash, 999999, "OptimisticOracleV2", "0")
    ).toBeUndefined();
    expect(
      constructOracleDappRequestLink(undefined, 1, "OptimisticOracleV2", "0")
    ).toBeUndefined();
  });
});

describe("buildRequestLink", () => {
  it("prefers the explorer where it serves the request", () => {
    expect(buildRequestLink(txHash, 137, "OptimisticOracleV2", "90")).toBe(
      `https://explorer.uma.xyz/requests?transactionHash=${txHash}&eventIndex=90`
    );
  });

  it("falls back to the oracle dapp for oracle types the explorer lacks", () => {
    expect(buildRequestLink(txHash, 137, "OptimisticOracleV3", "4")).toBe(
      `https://oracle.uma.xyz/request?transactionHash=${txHash}&chainId=137&oracleType=OptimisticV3&eventIndex=4`
    );
  });

  it("falls back to the oracle dapp for chains the explorer lacks", () => {
    expect(buildRequestLink(txHash, 1, "OptimisticOracleV2", "4")).toBe(
      `https://oracle.uma.xyz/request?transactionHash=${txHash}&chainId=1&oracleType=OptimisticV2&eventIndex=4`
    );
  });

  it("falls back to the testnet oracle dapp on testnet deployments", () => {
    expect(
      buildRequestLink(txHash, 11155111, "OptimisticOracleV2", "4", true)
    ).toBe(
      `https://testnet.oracle.uma.xyz/request?transactionHash=${txHash}&chainId=11155111&oracleType=OptimisticV2&eventIndex=4`
    );
  });

  it("returns undefined only when neither dapp can address the request", () => {
    expect(
      buildRequestLink(txHash, 999999, "OptimisticOracleV2", "4")
    ).toBeUndefined();
    expect(
      buildRequestLink(undefined, 137, "OptimisticOracleV2", "4")
    ).toBeUndefined();
  });
});

describe("isExplorerRequestLink", () => {
  it("distinguishes explorer links from oracle dapp links", () => {
    expect(
      isExplorerRequestLink(
        buildRequestLink(txHash, 137, "OptimisticOracleV2", "90")
      )
    ).toBe(true);
    expect(
      isExplorerRequestLink(
        buildRequestLink(txHash, 1, "OptimisticOracleV2", "4")
      )
    ).toBe(false);
    expect(
      isExplorerRequestLink(
        buildRequestLink(txHash, 11155111, "OptimisticOracleV2", "4", true)
      )
    ).toBe(false);
    expect(isExplorerRequestLink(undefined)).toBe(false);
  });
});
