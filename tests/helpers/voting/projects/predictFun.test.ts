import { describe, it, expect, vi } from "vitest";

vi.mock("helpers/config", () => ({
  config: {},
  appConfig: {},
  env: {},
}));

import { checkIfIsPredictFun } from "helpers/voting/projects/predictFun";
import { PREDICT_FUN_ANCIL_DATA, POLYMARKET_ANCIL_DATA } from "./constants";

describe("checkIfIsPredictFun", () => {
  describe("matches by initializer", () => {
    it("returns true for real Predict.Fun ancillary data", () => {
      expect(
        checkIfIsPredictFun("YES_OR_NO_QUERY", PREDICT_FUN_ANCIL_DATA)
      ).toBe(true);
    });

    it("returns true regardless of identifier when initializer matches", () => {
      expect(
        checkIfIsPredictFun("SOME_OTHER_IDENTIFIER", PREDICT_FUN_ANCIL_DATA)
      ).toBe(true);
    });
  });

  describe("non-matches", () => {
    it("returns false for Polymarket ancillary data", () => {
      expect(
        checkIfIsPredictFun("YES_OR_NO_QUERY", POLYMARKET_ANCIL_DATA)
      ).toBe(false);
    });

    it("returns false when requester is unknown", () => {
      const ancillaryData =
        "q: title: Will X happen?, res_data: p1: 0, p2: 1, p3: 0.5," +
        "ooRequester:0000000000000000000000000000000000000000";

      expect(checkIfIsPredictFun("YES_OR_NO_QUERY", ancillaryData)).toBe(false);
    });
  });
});
