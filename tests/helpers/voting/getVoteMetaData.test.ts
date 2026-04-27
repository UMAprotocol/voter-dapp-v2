import { describe, it, expect, vi } from "vitest";

vi.mock("helpers/config", () => ({
  config: {},
  appConfig: {},
  env: {},
}));

// getVoteMetaData imports from the "helpers" barrel which triggers WalletConnect init.
// Mock it, forwarding only the functions getVoteMetaData actually uses.
vi.mock("helpers", async () => {
  const polymarket = await import("helpers/voting/projects/polymarket");
  const predictFun = await import("helpers/voting/projects/predictFun");
  const probable = await import("helpers/voting/projects/probable");
  const misc = await import("helpers/util/misc");
  return {
    checkIfIsPolymarket: polymarket.checkIfIsPolymarket,
    checkIfIsPredictFun: predictFun.checkIfIsPredictFun,
    checkIfIsProbable: probable.checkIfIsProbable,
    encodeMultipleQuery: polymarket.encodeMultipleQuery,
    maybeMakePolymarketOptions: polymarket.maybeMakePolymarketOptions,
    makeBlockExplorerLink: misc.makeBlockExplorerLink,
  };
});

import { getVoteMetaData } from "helpers/voting/getVoteMetaData";
import { earlyRequestMagicNumber } from "constant/voting/earlyRequestMagicNumber";

// Real ancillary data from a MetaMarket request that failed to match any project.
// ooRequester 46500f8b... is MetaMarket (not registered in voter dapp).
// No res_data: field, so maybeMakePolymarketOptions cannot parse options.
const METAMARKET_YES_OR_NO_ANCIL_DATA = `title: Bitcoin Higher on April 21?, description: This market will resolve to "Hit" (Yes) if the final Binance 1 minute candle close price for BTC/USDT Apr 21 '26 12:00 in the ET timezone (noon) is higher than the "Close" price for the Apr 20 '26 12:00 ET candle.\n\nOtherwise this market will resolve to "Miss" (No).\n\nThe resolution source for this market is Binance, specifically the BTC/USDT "Close" prices currently available at https://www.binance.com/en/trade/BTC_USDT with "1m" and "Candles" selected on the top bar.\n\nNote, this market is based solely on the Binance BTC/USDT spot price, not on prices from other pairs or exchanges.,initializer:c7ad319cee0d92b607d07fa9847cbde08fff4528,ooRequester:46500f8bff8b8dee2da41e8960681c792270e10c,childRequester:880d041d67aab3b062995d11d4ad9c1018a3b02f,childChainId:8453`;

// Ancillary data with no project indicators at all
const BARE_YES_OR_NO_ANCIL_DATA =
  "title: Will it rain tomorrow?, description: Resolves Yes if it rains.";

const BARE_NUMERICAL_ANCIL_DATA =
  "title: What is the BTC price?, description: Report the BTC/USD price at settlement time.";

const earlyRequestOption = {
  label: "Early request",
  value: earlyRequestMagicNumber,
  secondaryLabel: "p4",
};

function optionLabels(
  options: { label: string }[] | undefined
): string[] | undefined {
  return options?.map((o) => o.label);
}

describe("getVoteMetaData identifier fallback options", () => {
  describe("YES_OR_NO_QUERY with no project match", () => {
    it("returns default Yes/No/Unknown/Early/Custom options for MetaMarket request", () => {
      const result = getVoteMetaData(
        "YES_OR_NO_QUERY",
        METAMARKET_YES_OR_NO_ANCIL_DATA,
        undefined
      );

      expect(result.options).toBeDefined();
      expect(optionLabels(result.options)).toEqual([
        "Yes",
        "No",
        "Unknown",
        "Early request",
        "Custom",
      ]);
    });

    it("includes correct values for each option", () => {
      const result = getVoteMetaData(
        "YES_OR_NO_QUERY",
        METAMARKET_YES_OR_NO_ANCIL_DATA,
        undefined
      );

      expect(result.options).toEqual([
        { label: "Yes", value: "1", secondaryLabel: "1" },
        { label: "No", value: "0", secondaryLabel: "0" },
        { label: "Unknown", value: "0.5", secondaryLabel: "0.5" },
        earlyRequestOption,
        { label: "Custom", value: "custom" },
      ]);
    });

    it("extracts title from ancillary data", () => {
      const result = getVoteMetaData(
        "YES_OR_NO_QUERY",
        METAMARKET_YES_OR_NO_ANCIL_DATA,
        undefined
      );

      expect(result.title).toBe("Bitcoin Higher on April 21?");
    });

    it("returns default options for bare YES_OR_NO_QUERY with no project indicators", () => {
      const result = getVoteMetaData(
        "YES_OR_NO_QUERY",
        BARE_YES_OR_NO_ANCIL_DATA,
        undefined
      );

      expect(result.options).toBeDefined();
      expect(optionLabels(result.options)).toEqual([
        "Yes",
        "No",
        "Unknown",
        "Early request",
        "Custom",
      ]);
      expect(result.title).toBe("Will it rain tomorrow?");
    });
  });

  describe("NUMERICAL with no project match", () => {
    it("returns Unresolvable/Early/Custom options", () => {
      const result = getVoteMetaData(
        "NUMERICAL",
        BARE_NUMERICAL_ANCIL_DATA,
        undefined
      );

      expect(result.options).toBeDefined();
      expect(optionLabels(result.options)).toEqual([
        "Unresolvable",
        "Early request",
        "Custom",
      ]);
    });
  });

  describe("completely unknown identifier", () => {
    it("returns default Yes/No/Early/Custom options", () => {
      const result = getVoteMetaData(
        "SOME_UNKNOWN_IDENTIFIER",
        "title: Unknown request, description: Something unknown.",
        undefined
      );

      expect(result.options).toBeDefined();
      expect(optionLabels(result.options)).toEqual([
        "Yes",
        "No",
        "Early request",
        "Custom",
      ]);
    });

    it("uses identifier name as title when no title: token in ancillary data", () => {
      const result = getVoteMetaData(
        "SOME_UNKNOWN_IDENTIFIER",
        "no structured data here",
        undefined
      );

      expect(result.title).toBe("SOME_UNKNOWN_IDENTIFIER");
      expect(result.options).toBeDefined();
    });
  });
});
